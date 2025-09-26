const BrowserHelper = require('../utils/browser.helper');
const TestHelper = require('../utils/test.helper');

/**
 * E2E: Invitación/agregado de estudiante por correo
 * Flujo:
 * - Registrar y autenticar usuario docente (vía API)
 * - Crear grupo (vía API)
 * - Abrir detalle del grupo y agregar estudiante por correo (UI -> prompt)
 * - Verificar que el estudiante aparece en la lista
 * - Verificar restricción de permisos (otro usuario no puede invitar)
 */

describe('Académica - Invitar/Agregar estudiantes por correo', () => {
  let browserHelper, testHelper;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3800';

  const genEmail = (prefix) => `${prefix}.${Date.now()}@test.com`;

  async function apiFetch(page, url, options) {
    return await page.evaluate(async (url, options) => {
      const res = await fetch(url, options);
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
      return { status: res.status, json };
    }, url, options);
  }

  async function registerAndLogin(page, email, password, role = 'expert') {
    // Registrar
    await apiFetch(page, `${BACKEND_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', surname: 'User', email, password, role })
    });
    // Login: token
    const tokenRes = await apiFetch(page, `${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, getToken: true })
    });
    const token = tokenRes.json && tokenRes.json.token;
    // Login: identidad
    const identityRes = await apiFetch(page, `${BACKEND_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const identity = identityRes.json && identityRes.json.user;
    // Persistir en localStorage
    await browserHelper.setLocalStorage('token', token);
    await browserHelper.setLocalStorage('authToken', token);
    await browserHelper.setLocalStorage('identity', JSON.stringify(identity));
    await browserHelper.setLocalStorage('user', JSON.stringify(identity));
    return { token, identity };
  }

  async function apiCreateGroup(page, token) {
    const payload = {
      name: `Grupo Test ${Date.now()}`,
      description: 'Grupo de pruebas automáticas',
      academicLevel: 'Universidad',
      grade: 'Semestre 1',
      maxStudents: 30,
      subjects: ['Pruebas']
    };
    const res = await apiFetch(page, `${BACKEND_URL}/api/academic-groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(payload)
    });
    if (res.status >= 400) throw new Error(`Error creando grupo: ${JSON.stringify(res.json)}`);
    return res.json && res.json.data && res.json.data._id;
  }

  beforeAll(async () => {
    browserHelper = new BrowserHelper();
    await browserHelper.launch();
    await browserHelper.newPage();
    testHelper = new TestHelper(browserHelper);
  });

  afterAll(async () => {
    if (browserHelper) await browserHelper.closeBrowser();
  });

  test('Invitar estudiante por correo (crea invitado si no existe)', async () => {
    // Auth docente
    const teacherEmail = genEmail('teacher');
    const password = 'Test12345!';
    const { token } = await registerAndLogin(browserHelper.page, teacherEmail, password, 'expert');

    // Crear grupo por API
    const groupId = await apiCreateGroup(browserHelper.page, token);

    // Abrir detalle del grupo
    await browserHelper.goto(`${FRONTEND_URL}/academia/groups/${groupId}`);
    await browserHelper.waitForSelector('.group-detail-container');

    // Abrir pestaña Estudiantes
    const studentsTab = await browserHelper.page.$("button[data-bs-target="#students"], #students-tab");
    if (studentsTab) await studentsTab.click();

    // Preparar prompt
    const studentEmail = genEmail('student');
    browserHelper.page.on('dialog', async (dialog) => {
      if (dialog.type() === 'prompt') {
        await dialog.accept(studentEmail);
      } else {
        await dialog.dismiss();
      }
    });

    // Click agregar
    const addBtn = await browserHelper.page.$x("//button[contains(., 'Agregar Estudiante')]");
    if (addBtn && addBtn[0]) await addBtn[0].click();

    // Esperar a que aparezca el estudiante en la lista
    await testHelper.waitForTimeout(1500);
    const hasStudent = await browserHelper.page.evaluate((email) => {
      const container = document.querySelector('#students');
      return container ? container.innerText.includes(email) : false;
    }, studentEmail);
    expect(hasStudent).toBe(true);
  }, 90000);

  test('Permisos: un usuario ajeno no puede invitar', async () => {
    // Auth docente -> crear grupo
    const teacherEmail = genEmail('teacher');
    const password = 'Test12345!';
    const { token } = await registerAndLogin(browserHelper.page, teacherEmail, password, 'expert');
    const groupId = await apiCreateGroup(browserHelper.page, token);

    // Auth otro usuario
    const outsiderEmail = genEmail('outsider');
    const outsider = await registerAndLogin(browserHelper.page, outsiderEmail, password, 'student');

    // Intentar invitar como outsider por API (debe 403)
    const res = await browserHelper.page.evaluate(async (BACKEND_URL, groupId, token, email) => {
      const r = await fetch(`${BACKEND_URL}/api/academic-groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ email })
      });
      return r.status;
    }, BACKEND_URL, groupId, outsider.token || localStorage.getItem('token'), genEmail('student2'));

    expect(res).toBe(403);
  }, 60000);
});


