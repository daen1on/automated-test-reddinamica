/**
 * Test de Jest para el sistema de notificaciones de envío de experiencias
 * Verifica el flujo completo de notificaciones al enviar experiencias
 */

const BrowserHelper = require('../utils/browser.helper');
const NotificationHelper = require('../utils/notification.helper');

describe('Sistema de Notificaciones de Envío de Experiencias', () => {
  let browserHelper;
  let adminBrowserHelper;
  let facilitatorBrowserHelper;
  let userNotificationHelper;
  let adminNotificationHelper;
  let facilitatorNotificationHelper;

  beforeAll(async () => {
    // Configurar tres navegadores: usuario, admin y facilitador
    browserHelper = new BrowserHelper();
    adminBrowserHelper = new BrowserHelper();
    facilitatorBrowserHelper = new BrowserHelper();
    
    await browserHelper.launch();
    await adminBrowserHelper.launch();
    await facilitatorBrowserHelper.launch();
    
    // Configurar helpers de notificaciones
    userNotificationHelper = new NotificationHelper(browserHelper);
    adminNotificationHelper = new NotificationHelper(adminBrowserHelper);
    facilitatorNotificationHelper = new NotificationHelper(facilitatorBrowserHelper);
  });

  afterAll(async () => {
    await browserHelper.closeBrowser();
    await adminBrowserHelper.closeBrowser();
    await facilitatorBrowserHelper.closeBrowser();
  });

  beforeEach(async () => {
    await browserHelper.goto('http://localhost:4200');
    await adminBrowserHelper.goto('http://localhost:4200');
    await facilitatorBrowserHelper.goto('http://localhost:4200');
  });

  test('Debe enviar notificaciones correctas al enviar experiencia tipo "Consideración" con 1 área y 1 nivel', async () => {
    console.log('🧪 Iniciando prueba de experiencia tipo "Consideración" (1 área, 1 nivel)...');

    // ===== PASO 1: LOGIN COMO USUARIO REGULAR =====
    console.log('1️⃣ Haciendo login como usuario regular...');
    await browserHelper.goto('http://localhost:4200/login');
    
    await browserHelper.type('#email', 'vidagumfacilitador@test.co');
    await browserHelper.type('#password', '123456');
    await browserHelper.click('button[type="submit"]');
    
    await browserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login de usuario completado');

    // ===== PASO 2: LOGIN COMO ADMINISTRADOR =====
    console.log('2️⃣ Haciendo login como administrador...');
    await adminBrowserHelper.goto('http://localhost:4200/login');
    
    await adminBrowserHelper.type('#email', 'admin@test.co'); //probar con admin delegado
    await adminBrowserHelper.type('#password', '123456'); //modificar segun se requiera
    await adminBrowserHelper.click('button[type="submit"]');
    
    await adminBrowserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login de administrador completado');

    // ===== PASO 3: OBTENER CONTEO INICIAL DE NOTIFICACIONES =====
    console.log('3️⃣ Obteniendo conteo inicial de notificaciones...');
    
    const initialUserNotifications = await userNotificationHelper.getNotificationCount();
    const initialAdminNotifications = await adminNotificationHelper.getNotificationCount();
    
    console.log(`📊 Notificaciones iniciales - Usuario: ${initialUserNotifications}, Admin: ${initialAdminNotifications}`);

    // ===== PASO 4: NAVEGAR A LECCIONES Y ABRIR MODAL DE EXPERIENCIA =====
    console.log('4️⃣ Navegando a lecciones y abriendo modal de experiencia...');
    await browserHelper.goto('http://localhost:4200/inicio/lecciones');
    await browserHelper.waitForSelector('.lessons-container', { timeout: 10000 });
    
    // Buscar y hacer clic en el botón de enviar experiencia
    await browserHelper.click('[data-bs-target="#send"]');
    await browserHelper.waitForSelector('#send.modal.show', { timeout: 5000 });
    console.log('✅ Modal de experiencia abierto');

    // ===== PASO 5: LLENAR FORMULARIO DE EXPERIENCIA =====
    console.log('5️⃣ Llenando formulario de experiencia...');
    
    const timestamp = Date.now();
    const experienceTitle = `Experiencia Consideración Automatizada ${timestamp}`;
    
    // Llenar campos básicos
    await browserHelper.type('#title', experienceTitle);
    await browserHelper.type('#resume', 'Este es un resumen de prueba para la experiencia automatizada tipo Consideración');
    await browserHelper.type('#references', 'Referencias de prueba para experiencia de consideración');

    // Seleccionar tipo "Consideración"
    await browserHelper.waitForSelector('#type', { timeout: 5000 });
    await browserHelper.evaluate(() => {
      const select = document.querySelector('#type');
      select.value = 'Consideración';
      select.dispatchEvent(new Event('change'));
    });
    
    console.log('✅ Tipo "Consideración" seleccionado');

    // ===== PASO 6: SELECCIONAR 1 ÁREA DE CONOCIMIENTO =====
    console.log('6️⃣ Seleccionando área de conocimiento...');
    
    const knowledgeAreaInput = 'input[ng-reflect-name="knowledgeAreaInput"]';
    await browserHelper.waitForSelector(knowledgeAreaInput, { timeout: 5000 });
    await browserHelper.type(knowledgeAreaInput, 'Educación');
    
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Área de conocimiento seleccionada');

    // ===== PASO 7: SELECCIONAR 1 NIVEL ACADÉMICO =====
    console.log('7️⃣ Seleccionando nivel académico...');
    
    const levelInput = 'input[ng-reflect-name="levelInput"]';
    await browserHelper.waitForSelector(levelInput, { timeout: 5000 });
    await browserHelper.type(levelInput, 'Secundaria');
    
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Nivel académico seleccionado');

    // ===== PASO 8: VERIFICAR QUE NO APARECE CAMPO DE FACILITADOR =====
    console.log('8️⃣ Verificando que no aparece campo de facilitador para tipo "Consideración"...');
    
    const facilitatorFieldExists = await browserHelper.evaluate(() => {
      return document.querySelector('#suggested_facilitator') !== null;
    });
    
    expect(facilitatorFieldExists).toBe(false);
    console.log('✅ Campo de facilitador correctamente oculto para tipo "Consideración"');

    // ===== PASO 9: ENVIAR EXPERIENCIA =====
    console.log('9️⃣ Enviando experiencia...');
    
    await browserHelper.click('button[type="submit"]');
    await browserHelper.waitForSelector('.alert-success', { timeout: 10000 });
    console.log('✅ Experiencia enviada exitosamente');

    // ===== PASO 10: VERIFICAR NOTIFICACIÓN DEL USUARIO =====
    console.log('🔟 Verificando notificación del usuario...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalUserNotifications = await userNotificationHelper.getNotificationCount();
    expect(finalUserNotifications).toBeGreaterThan(initialUserNotifications);
    
    const userHasConfirmation = await userNotificationHelper.hasNotificationWithTitle('Experiencia enviada para revisión');
    expect(userHasConfirmation).toBe(true);
    
    console.log('✅ Notificación de confirmación al usuario verificada');

    // ===== PASO 11: VERIFICAR NOTIFICACIÓN DEL ADMINISTRADOR =====
    console.log('1️⃣1️⃣ Verificando notificación del administrador...');
    
    const finalAdminNotifications = await adminNotificationHelper.getNotificationCount();
    expect(finalAdminNotifications).toBeGreaterThan(initialAdminNotifications);
    
    const adminHasNewExperience = await adminNotificationHelper.hasNotificationWithTitle('Nueva experiencia enviada');
    expect(adminHasNewExperience).toBe(true);
    
    console.log('✅ Notificación al administrador verificada');

    // ===== PASO 12: VERIFICAR CONTENIDO DE NOTIFICACIONES =====
    console.log('1️⃣2️⃣ Verificando contenido de notificaciones...');
    
    const adminNotificationContent = await adminNotificationHelper.getNotificationContent('Nueva experiencia enviada');
    expect(adminNotificationContent).toContain(experienceTitle);
    expect(adminNotificationContent).toContain('Consideración');
    
    console.log('✅ Contenido de notificaciones verificado');

    // ===== PASO 13: TOMAR SCREENSHOTS =====
    await browserHelper.screenshot(`send-experience-consideracion-1area-1level-user-${timestamp}.png`);
    await adminBrowserHelper.screenshot(`send-experience-consideracion-1area-1level-admin-${timestamp}.png`);

    console.log('🎉 Prueba de experiencia tipo "Consideración" (1 área, 1 nivel) completada exitosamente');
  }, 120000);

  test('Debe enviar notificaciones correctas al enviar experiencia tipo "Desarrollo" con múltiples áreas y niveles', async () => {
    console.log('🧪 Iniciando prueba de experiencia tipo "Desarrollo" (múltiples áreas y niveles)...');

    // ===== PASO 1: LOGIN COMO USUARIO REGULAR =====
    console.log('1️⃣ Haciendo login como usuario regular...');
    await browserHelper.goto('http://localhost:4200/login');
    
    await browserHelper.type('#email', 'vidagumfacilitador@test.co');
    await browserHelper.type('#password', 'test123');
    await browserHelper.click('button[type="submit"]');
    
    await browserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login de usuario completado');

    // ===== PASO 2: LOGIN COMO ADMINISTRADOR =====
    console.log('2️⃣ Haciendo login como administrador...');
    await adminBrowserHelper.goto('http://localhost:4200/login');
    
    await adminBrowserHelper.type('#email', 'admin@test.co');
    await adminBrowserHelper.type('#password', 'admin123');
    await adminBrowserHelper.click('button[type="submit"]');
    
    await adminBrowserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login de administrador completado');

    // ===== PASO 3: LOGIN COMO FACILITADOR =====
    console.log('3️⃣ Haciendo login como facilitador...');
    await facilitatorBrowserHelper.goto('http://localhost:4200/login');
    
    await facilitatorBrowserHelper.type('#email', 'facilitador@test.co');
    await facilitatorBrowserHelper.type('#password', 'facilitador123');
    await facilitatorBrowserHelper.click('button[type="submit"]');
    
    await facilitatorBrowserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login de facilitador completado');

    // ===== PASO 4: OBTENER CONTEO INICIAL DE NOTIFICACIONES =====
    console.log('4️⃣ Obteniendo conteo inicial de notificaciones...');
    
    const initialUserNotifications = await userNotificationHelper.getNotificationCount();
    const initialAdminNotifications = await adminNotificationHelper.getNotificationCount();
    const initialFacilitatorNotifications = await facilitatorNotificationHelper.getNotificationCount();
    
    console.log(`📊 Notificaciones iniciales - Usuario: ${initialUserNotifications}, Admin: ${initialAdminNotifications}, Facilitador: ${initialFacilitatorNotifications}`);

    // ===== PASO 5: NAVEGAR A LECCIONES Y ABRIR MODAL DE EXPERIENCIA =====
    console.log('5️⃣ Navegando a lecciones y abriendo modal de experiencia...');
    await browserHelper.goto('http://localhost:4200/inicio/lecciones');
    await browserHelper.waitForSelector('.lessons-container', { timeout: 10000 });
    
    await browserHelper.click('[data-bs-target="#send"]');
    await browserHelper.waitForSelector('#send.modal.show', { timeout: 5000 });
    console.log('✅ Modal de experiencia abierto');

    // ===== PASO 6: LLENAR FORMULARIO DE EXPERIENCIA =====
    console.log('6️⃣ Llenando formulario de experiencia...');
    
    const timestamp = Date.now();
    const experienceTitle = `Experiencia Desarrollo Múltiple ${timestamp}`;
    
    await browserHelper.type('#title', experienceTitle);
    await browserHelper.type('#resume', 'Resumen de experiencia tipo Desarrollo con múltiples áreas y niveles');
    await browserHelper.type('#references', 'Referencias para experiencia de desarrollo con facilitador');

    // Seleccionar tipo "Desarrollo"
    await browserHelper.waitForSelector('#type', { timeout: 5000 });
    await browserHelper.evaluate(() => {
      const select = document.querySelector('#type');
      select.value = 'Desarrollo';
      select.dispatchEvent(new Event('change'));
    });
    
    console.log('✅ Tipo "Desarrollo" seleccionado');

    // ===== PASO 7: VERIFICAR QUE APARECE CAMPO DE FACILITADOR =====
    console.log('7️⃣ Verificando que aparece campo de facilitador para tipo "Desarrollo"...');
    
    // Esperar a que aparezca el campo de facilitador
    await browserHelper.waitForSelector('#suggested_facilitator', { timeout: 5000 });
    
    const facilitatorFieldExists = await browserHelper.evaluate(() => {
      return document.querySelector('#suggested_facilitator') !== null;
    });
    
    expect(facilitatorFieldExists).toBe(true);
    console.log('✅ Campo de facilitador correctamente mostrado para tipo "Desarrollo"');

    // ===== PASO 8: SELECCIONAR MÚLTIPLES ÁREAS DE CONOCIMIENTO =====
    console.log('8️⃣ Seleccionando múltiples áreas de conocimiento...');
    
    const knowledgeAreaInput = 'input[ng-reflect-name="knowledgeAreaInput"]';
    
    // Seleccionar primera área
    await browserHelper.type(knowledgeAreaInput, 'Ingeniería');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    // Seleccionar segunda área
    await browserHelper.type(knowledgeAreaInput, 'Tecnología');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    // Seleccionar tercera área
    await browserHelper.type(knowledgeAreaInput, 'Sistemas');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Múltiples áreas de conocimiento seleccionadas');

    // ===== PASO 9: SELECCIONAR MÚLTIPLES NIVELES ACADÉMICOS =====
    console.log('9️⃣ Seleccionando múltiples niveles académicos...');
    
    const levelInput = 'input[ng-reflect-name="levelInput"]';
    
    // Seleccionar primer nivel
    await browserHelper.type(levelInput, 'Bachillerato');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    // Seleccionar segundo nivel
    await browserHelper.type(levelInput, 'Universitario');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Múltiples niveles académicos seleccionados');

    // ===== PASO 10: SELECCIONAR FACILITADOR SUGERIDO =====
    console.log('🔟 Seleccionando facilitador sugerido...');
    
    await browserHelper.evaluate(() => {
      const select = document.querySelector('#suggested_facilitator');
      if (select && select.options.length > 1) {
        select.selectedIndex = 1; // Seleccionar la primera opción real
        select.dispatchEvent(new Event('change'));
      }
    });
    
    console.log('✅ Facilitador sugerido seleccionado');

    // ===== PASO 11: ENVIAR EXPERIENCIA =====
    console.log('1️⃣1️⃣ Enviando experiencia...');
    
    await browserHelper.click('button[type="submit"]');
    await browserHelper.waitForSelector('.alert-success', { timeout: 10000 });
    console.log('✅ Experiencia enviada exitosamente');

    // ===== PASO 12: VERIFICAR NOTIFICACIÓN DEL USUARIO =====
    console.log('1️⃣2️⃣ Verificando notificación del usuario...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalUserNotifications = await userNotificationHelper.getNotificationCount();
    expect(finalUserNotifications).toBeGreaterThan(initialUserNotifications);
    
    const userHasConfirmation = await userNotificationHelper.hasNotificationWithTitle('Experiencia enviada para revisión');
    expect(userHasConfirmation).toBe(true);
    
    console.log('✅ Notificación de confirmación al usuario verificada');

    // ===== PASO 13: VERIFICAR NOTIFICACIÓN DEL ADMINISTRADOR =====
    console.log('1️⃣3️⃣ Verificando notificación del administrador...');
    
    const finalAdminNotifications = await adminNotificationHelper.getNotificationCount();
    expect(finalAdminNotifications).toBeGreaterThan(initialAdminNotifications);
    
    const adminHasNewExperience = await adminNotificationHelper.hasNotificationWithTitle('Nueva experiencia enviada');
    expect(adminHasNewExperience).toBe(true);
    
    // Verificar que menciona el tipo "Desarrollo"
    const adminNotificationContent = await adminNotificationHelper.getNotificationContent('Nueva experiencia enviada');
    expect(adminNotificationContent).toContain(experienceTitle);
    expect(adminNotificationContent).toContain('Desarrollo');
    
    console.log('✅ Notificación al administrador verificada');

    // ===== PASO 14: VERIFICAR NOTIFICACIÓN AL FACILITADOR =====
    console.log('1️⃣4️⃣ Verificando notificación al facilitador...');
    
    const finalFacilitatorNotifications = await facilitatorNotificationHelper.getNotificationCount();
    expect(finalFacilitatorNotifications).toBeGreaterThan(initialFacilitatorNotifications);
    
    const facilitatorHasInvitation = await facilitatorNotificationHelper.hasNotificationWithTitle('Te han sugerido como facilitador de una experiencia');
    expect(facilitatorHasInvitation).toBe(true);
    
    console.log('✅ Notificación al facilitador verificada');

    // ===== PASO 15: VERIFICAR CONTENIDO DE NOTIFICACIÓN AL FACILITADOR =====
    console.log('1️⃣5️⃣ Verificando contenido de notificación al facilitador...');
    
    const facilitatorNotificationContent = await facilitatorNotificationHelper.getNotificationContent('Te han sugerido como facilitador de una experiencia');
    expect(facilitatorNotificationContent).toContain(experienceTitle);
    
    console.log('✅ Contenido de notificación al facilitador verificado');

    // ===== PASO 16: TOMAR SCREENSHOTS =====
    await browserHelper.screenshot(`send-experience-desarrollo-multiple-user-${timestamp}.png`);
    await adminBrowserHelper.screenshot(`send-experience-desarrollo-multiple-admin-${timestamp}.png`);
    await facilitatorBrowserHelper.screenshot(`send-experience-desarrollo-multiple-facilitator-${timestamp}.png`);

    console.log('🎉 Prueba de experiencia tipo "Desarrollo" (múltiples áreas y niveles) completada exitosamente');
  }, 150000);

  test('Debe manejar correctamente la aprobación de experiencia', async () => {
    console.log('🧪 Iniciando prueba de aprobación de experiencia...');

    // ===== PASO 1: CREAR EXPERIENCIA PRIMERO =====
    console.log('1️⃣ Creando experiencia para aprobar...');
    
    await browserHelper.goto('http://localhost:4200/login');
    await browserHelper.type('#email', 'vidagumfacilitador@test.co');
    await browserHelper.type('#password', 'test123');
    await browserHelper.click('button[type="submit"]');
    await browserHelper.waitForSelector('.navbar', { timeout: 10000 });

    // Crear experiencia rápida
    await browserHelper.goto('http://localhost:4200/inicio/lecciones');
    await browserHelper.click('[data-bs-target="#send"]');
    await browserHelper.waitForSelector('#send.modal.show', { timeout: 5000 });

    const timestamp = Date.now();
    const experienceTitle = `Experiencia Para Aprobar ${timestamp}`;
    
    await browserHelper.type('#title', experienceTitle);
    await browserHelper.type('#resume', 'Experiencia para probar aprobación');
    await browserHelper.type('#references', 'Referencias de prueba');
    
    // Seleccionar tipo
    await browserHelper.evaluate(() => {
      const select = document.querySelector('#type');
      select.value = 'Consideración';
      select.dispatchEvent(new Event('change'));
    });

    // Seleccionar área y nivel mínimos
    const knowledgeAreaInput = 'input[ng-reflect-name="knowledgeAreaInput"]';
    await browserHelper.type(knowledgeAreaInput, 'Prueba');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');

    const levelInput = 'input[ng-reflect-name="levelInput"]';
    await browserHelper.type(levelInput, 'Universitario');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');

    await browserHelper.click('button[type="submit"]');
    await browserHelper.waitForSelector('.alert-success', { timeout: 10000 });
    
    console.log('✅ Experiencia creada para prueba de aprobación');

    // ===== PASO 2: LOGIN COMO ADMINISTRADOR Y APROBAR =====
    console.log('2️⃣ Login como administrador para aprobar...');
    
    await adminBrowserHelper.goto('http://localhost:4200/login');
    await adminBrowserHelper.type('#email', 'admin@test.co');
    await adminBrowserHelper.type('#password', 'admin123');
    await adminBrowserHelper.click('button[type="submit"]');
    await adminBrowserHelper.waitForSelector('.navbar', { timeout: 10000 });

    // Navegar al panel de administración de lecciones
    await adminBrowserHelper.goto('http://localhost:4200/admin/lecciones');
    await adminBrowserHelper.waitForSelector('.admin-lessons-container', { timeout: 10000 });

    // Buscar la experiencia recién creada y aprobarla
    // Nota: Este paso requiere que el panel de admin tenga la funcionalidad implementada
    console.log('⚠️ Funcionalidad de aprobación desde panel admin pendiente de implementación');

    // ===== PASO 3: VERIFICAR NOTIFICACIÓN DE APROBACIÓN =====
    console.log('3️⃣ Verificando notificación de aprobación...');
    
    // Por ahora, simular la aprobación directamente via API o base de datos
    // En una implementación completa, esto se haría a través de la interfaz
    
    console.log('⚠️ Prueba de aprobación requiere implementación completa del panel admin');
    
    // TODO: Implementar cuando esté disponible el panel de administración
    // 1. Buscar la experiencia en la lista
    // 2. Hacer clic en "Aprobar"
    // 3. Verificar que el usuario recibe notificación de aprobación
    
  }, 90000);

  test('Debe manejar correctamente el rechazo de experiencia', async () => {
    console.log('🧪 Iniciando prueba de rechazo de experiencia...');

    // Similar a la prueba de aprobación, pero para rechazo
    console.log('⚠️ Prueba de rechazo pendiente de implementación completa del panel admin');
    
    // TODO: Implementar cuando esté disponible el panel de administración
    // 1. Crear experiencia
    // 2. Login como admin
    // 3. Rechazar experiencia con motivo
    // 4. Verificar notificación de rechazo al usuario
    
  }, 60000);
});
