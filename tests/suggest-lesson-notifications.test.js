/**
 * Test de Jest para el sistema de notificaciones de sugerencias de lecciones
 * Verifica el flujo completo de notificaciones al sugerir lecciones
 */

const BrowserHelper = require('../utils/browser.helper');
const NotificationHelper = require('../utils/notification.helper');

describe('Sistema de Notificaciones de Sugerencias de Lecciones', () => {
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

  test('Debe enviar notificaciones correctas al sugerir lección con 1 área y 1 nivel', async () => {
    console.log('🧪 Iniciando prueba de sugerencia de lección (1 área, 1 nivel)...');

    // ===== PASO 1: LOGIN COMO USUARIO REGULAR =====
    console.log('1️⃣ Haciendo login como usuario regular...');
    await browserHelper.goto('http://localhost:4200/login');
    
    await browserHelper.type('#email', 'vidagumfacilitador@test.co');
    await browserHelper.type('#password', 'test123');
    await browserHelper.click('button[type="submit"]');
    
    // Esperar a que se complete el login
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

    // ===== PASO 3: OBTENER CONTEO INICIAL DE NOTIFICACIONES =====
    console.log('3️⃣ Obteniendo conteo inicial de notificaciones...');
    
    const initialUserNotifications = await userNotificationHelper.getNotificationCount();
    const initialAdminNotifications = await adminNotificationHelper.getNotificationCount();
    
    console.log(`📊 Notificaciones iniciales - Usuario: ${initialUserNotifications}, Admin: ${initialAdminNotifications}`);

    // ===== PASO 4: NAVEGAR A LECCIONES Y ABRIR MODAL =====
    console.log('4️⃣ Navegando a lecciones y abriendo modal de sugerencia...');
    await browserHelper.goto('http://localhost:4200/inicio/lecciones');
    await browserHelper.waitForSelector('.lessons-container', { timeout: 10000 });
    
    // Buscar y hacer clic en el botón de sugerir lección
    await browserHelper.click('[data-bs-target="#add"]');
    await browserHelper.waitForSelector('#add.modal.show', { timeout: 5000 });
    console.log('✅ Modal de sugerencia abierto');

    // ===== PASO 5: LLENAR FORMULARIO DE SUGERENCIA =====
    console.log('5️⃣ Llenando formulario de sugerencia...');
    
    const timestamp = Date.now();
    const lessonTitle = `Lección de Prueba Automatizada ${timestamp}`;
    
    // Llenar campos básicos
    await browserHelper.type('#title', lessonTitle);
    await browserHelper.type('#resume', 'Este es un resumen de prueba para la lección automatizada de Jest');
    await browserHelper.type('#justification', 'Esta es la justificación de prueba para verificar el sistema de notificaciones');
    await browserHelper.type('#references', 'Referencias de prueba: Jest, Puppeteer, Automated Testing');

    // ===== PASO 6: SELECCIONAR 1 ÁREA DE CONOCIMIENTO =====
    console.log('6️⃣ Seleccionando área de conocimiento...');
    
    // Escribir en el input de áreas para activar el autocompletado
    const knowledgeAreaInput = 'input[ng-reflect-name="knowledgeAreaInput"]';
    await browserHelper.waitForSelector(knowledgeAreaInput, { timeout: 5000 });
    await browserHelper.type(knowledgeAreaInput, 'Matemáticas');
    
    // Esperar a que aparezca el dropdown y seleccionar la primera opción
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Área de conocimiento seleccionada');

    // ===== PASO 7: SELECCIONAR 1 NIVEL ACADÉMICO =====
    console.log('7️⃣ Seleccionando nivel académico...');
    
    // Escribir en el input de niveles para activar el autocompletado
    const levelInput = 'input[ng-reflect-name="levelInput"]';
    await browserHelper.waitForSelector(levelInput, { timeout: 5000 });
    await browserHelper.type(levelInput, 'Universitario');
    
    // Esperar a que aparezca el dropdown y seleccionar la primera opción
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Nivel académico seleccionado');

    // ===== PASO 8: ENVIAR SUGERENCIA =====
    console.log('8️⃣ Enviando sugerencia...');
    
    await browserHelper.click('button[type="submit"]');
    
    // Esperar a que aparezca el mensaje de éxito
    await browserHelper.waitForSelector('.alert-success', { timeout: 10000 });
    console.log('✅ Sugerencia enviada exitosamente');

    // ===== PASO 9: VERIFICAR NOTIFICACIÓN DEL USUARIO =====
    console.log('9️⃣ Verificando notificación del usuario...');
    
    // Esperar un momento para que se procesen las notificaciones
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalUserNotifications = await userNotificationHelper.getNotificationCount();
    expect(finalUserNotifications).toBeGreaterThan(initialUserNotifications);
    
    // Verificar que existe una notificación de confirmación
    const userHasConfirmation = await userNotificationHelper.hasNotificationWithTitle('Sugerencia de lección enviada');
    expect(userHasConfirmation).toBe(true);
    
    console.log('✅ Notificación de confirmación al usuario verificada');

    // ===== PASO 10: VERIFICAR NOTIFICACIÓN DEL ADMINISTRADOR =====
    console.log('🔟 Verificando notificación del administrador...');
    
    const finalAdminNotifications = await adminNotificationHelper.getNotificationCount();
    expect(finalAdminNotifications).toBeGreaterThan(initialAdminNotifications);
    
    // Verificar que existe una notificación de nueva sugerencia
    const adminHasNewSuggestion = await adminNotificationHelper.hasNotificationWithTitle('Nueva sugerencia de lección');
    expect(adminHasNewSuggestion).toBe(true);
    
    console.log('✅ Notificación al administrador verificada');

    // ===== PASO 11: VERIFICAR CONTENIDO DE NOTIFICACIONES =====
    console.log('1️⃣1️⃣ Verificando contenido de notificaciones...');
    
    // Verificar que la notificación del admin contiene el título de la lección
    const adminNotificationContent = await adminNotificationHelper.getNotificationContent('Nueva sugerencia de lección');
    expect(adminNotificationContent).toContain(lessonTitle);
    
    console.log('✅ Contenido de notificaciones verificado');

    // ===== PASO 12: TOMAR SCREENSHOTS =====
    await browserHelper.screenshot(`suggest-lesson-1area-1level-user-${timestamp}.png`);
    await adminBrowserHelper.screenshot(`suggest-lesson-1area-1level-admin-${timestamp}.png`);

    console.log('🎉 Prueba de sugerencia de lección (1 área, 1 nivel) completada exitosamente');
  }, 120000); // Timeout de 2 minutos

  test('Debe enviar notificaciones correctas al sugerir lección con múltiples áreas y niveles', async () => {
    console.log('🧪 Iniciando prueba de sugerencia de lección (múltiples áreas y niveles)...');

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

    // ===== PASO 3: OBTENER CONTEO INICIAL DE NOTIFICACIONES =====
    console.log('3️⃣ Obteniendo conteo inicial de notificaciones...');
    
    const initialUserNotifications = await userNotificationHelper.getNotificationCount();
    const initialAdminNotifications = await adminNotificationHelper.getNotificationCount();
    
    console.log(`📊 Notificaciones iniciales - Usuario: ${initialUserNotifications}, Admin: ${initialAdminNotifications}`);

    // ===== PASO 4: NAVEGAR A LECCIONES Y ABRIR MODAL =====
    console.log('4️⃣ Navegando a lecciones y abriendo modal de sugerencia...');
    await browserHelper.goto('http://localhost:4200/inicio/lecciones');
    await browserHelper.waitForSelector('.lessons-container', { timeout: 10000 });
    
    await browserHelper.click('[data-bs-target="#add"]');
    await browserHelper.waitForSelector('#add.modal.show', { timeout: 5000 });
    console.log('✅ Modal de sugerencia abierto');

    // ===== PASO 5: LLENAR FORMULARIO DE SUGERENCIA =====
    console.log('5️⃣ Llenando formulario de sugerencia...');
    
    const timestamp = Date.now();
    const lessonTitle = `Lección Múltiple Automatizada ${timestamp}`;
    
    await browserHelper.type('#title', lessonTitle);
    await browserHelper.type('#resume', 'Resumen de prueba para lección con múltiples áreas y niveles');
    await browserHelper.type('#justification', 'Justificación para probar múltiples selecciones en el sistema');
    await browserHelper.type('#references', 'Referencias múltiples: Área1, Área2, Nivel1, Nivel2');

    // ===== PASO 6: SELECCIONAR MÚLTIPLES ÁREAS DE CONOCIMIENTO =====
    console.log('6️⃣ Seleccionando múltiples áreas de conocimiento...');
    
    const knowledgeAreaInput = 'input[ng-reflect-name="knowledgeAreaInput"]';
    
    // Seleccionar primera área
    await browserHelper.type(knowledgeAreaInput, 'Matemáticas');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    // Seleccionar segunda área
    await browserHelper.type(knowledgeAreaInput, 'Física');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    // Seleccionar tercera área
    await browserHelper.type(knowledgeAreaInput, 'Química');
    await browserHelper.waitForSelector('.knowledge-area-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.knowledge-area-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Múltiples áreas de conocimiento seleccionadas');

    // ===== PASO 7: SELECCIONAR MÚLTIPLES NIVELES ACADÉMICOS =====
    console.log('7️⃣ Seleccionando múltiples niveles académicos...');
    
    const levelInput = 'input[ng-reflect-name="levelInput"]';
    
    // Seleccionar primer nivel
    await browserHelper.type(levelInput, 'Secundaria');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    // Seleccionar segundo nivel
    await browserHelper.type(levelInput, 'Universitario');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    // Seleccionar tercer nivel
    await browserHelper.type(levelInput, 'Posgrado');
    await browserHelper.waitForSelector('.level-autocomplete .dropdown-menu.show', { timeout: 3000 });
    await browserHelper.click('.level-autocomplete .dropdown-item:first-child');
    
    console.log('✅ Múltiples niveles académicos seleccionados');

    // ===== PASO 8: SELECCIONAR FACILITADOR SUGERIDO =====
    console.log('8️⃣ Seleccionando facilitador sugerido...');
    
    const facilitatorSelect = '#suggested_facilitator';
    await browserHelper.waitForSelector(facilitatorSelect, { timeout: 5000 });
    
    // Seleccionar el primer facilitador disponible (que no sea la opción vacía)
    await browserHelper.evaluate(() => {
      const select = document.querySelector('#suggested_facilitator');
      if (select && select.options.length > 1) {
        select.selectedIndex = 1; // Seleccionar la primera opción real
        select.dispatchEvent(new Event('change'));
      }
    });
    
    console.log('✅ Facilitador sugerido seleccionado');

    // ===== PASO 9: ENVIAR SUGERENCIA =====
    console.log('9️⃣ Enviando sugerencia...');
    
    await browserHelper.click('button[type="submit"]');
    await browserHelper.waitForSelector('.alert-success', { timeout: 10000 });
    console.log('✅ Sugerencia enviada exitosamente');

    // ===== PASO 10: VERIFICAR NOTIFICACIONES =====
    console.log('🔟 Verificando notificaciones...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar notificación del usuario
    const finalUserNotifications = await userNotificationHelper.getNotificationCount();
    expect(finalUserNotifications).toBeGreaterThan(initialUserNotifications);
    
    const userHasConfirmation = await userNotificationHelper.hasNotificationWithTitle('Sugerencia de lección enviada');
    expect(userHasConfirmation).toBe(true);
    
    // Verificar notificación del administrador
    const finalAdminNotifications = await adminNotificationHelper.getNotificationCount();
    expect(finalAdminNotifications).toBeGreaterThan(initialAdminNotifications);
    
    const adminHasNewSuggestion = await adminNotificationHelper.hasNotificationWithTitle('Nueva sugerencia de lección');
    expect(adminHasNewSuggestion).toBe(true);
    
    console.log('✅ Notificaciones verificadas');

    // ===== PASO 11: VERIFICAR NOTIFICACIÓN AL FACILITADOR =====
    console.log('1️⃣1️⃣ Verificando notificación al facilitador...');
    
    // Login como facilitador para verificar notificación
    await facilitatorBrowserHelper.goto('http://localhost:4200/login');
    await facilitatorBrowserHelper.type('#email', 'facilitador@test.co');
    await facilitatorBrowserHelper.type('#password', 'facilitador123');
    await facilitatorBrowserHelper.click('button[type="submit"]');
    await facilitatorBrowserHelper.waitForSelector('.navbar', { timeout: 10000 });
    
    // Verificar que el facilitador recibió la notificación
    const facilitatorHasInvitation = await facilitatorNotificationHelper.hasNotificationWithTitle('Te han sugerido como facilitador');
    expect(facilitatorHasInvitation).toBe(true);
    
    console.log('✅ Notificación al facilitador verificada');

    // ===== PASO 12: TOMAR SCREENSHOTS =====
    await browserHelper.screenshot(`suggest-lesson-multiple-user-${timestamp}.png`);
    await adminBrowserHelper.screenshot(`suggest-lesson-multiple-admin-${timestamp}.png`);
    await facilitatorBrowserHelper.screenshot(`suggest-lesson-multiple-facilitator-${timestamp}.png`);

    console.log('🎉 Prueba de sugerencia de lección (múltiples áreas y niveles) completada exitosamente');
  }, 150000); // Timeout de 2.5 minutos

  test('Debe manejar correctamente la aprobación de sugerencia de lección', async () => {
    console.log('🧪 Iniciando prueba de aprobación de sugerencia...');

    // Esta prueba requiere que primero se cree una sugerencia y luego se apruebe
    // Se puede implementar como una extensión de las pruebas anteriores
    
    // TODO: Implementar flujo de aprobación
    // 1. Crear sugerencia (reutilizar código anterior)
    // 2. Login como admin
    // 3. Navegar al panel de administración
    // 4. Aprobar la sugerencia
    // 5. Verificar notificación al usuario original
    
    console.log('⚠️ Prueba de aprobación pendiente de implementación completa');
  }, 60000);
});
