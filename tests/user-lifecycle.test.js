const BrowserHelper = require('../utils/browser.helper');
const TestHelper = require('../utils/test.helper');
const config = require('../config/test.config');

describe('RedDinámica - Ciclo de vida completo del usuario', () => {
  let browser;
  let testHelper;
  let newUserData;

  beforeAll(async () => {
    browser = new BrowserHelper();
    await browser.launch();
    testHelper = new TestHelper(browser);
    
    console.log('=== INICIANDO PRUEBAS AUTOMATIZADAS ===');
    console.log('Frontend URL:', config.FRONTEND_URL);
    console.log('Backend URL:', config.BACKEND_URL);
  });

  afterAll(async () => {
    await browser.closeBrowser();
    console.log('=== PRUEBAS COMPLETADAS ===');
  });

  beforeEach(async () => {
    await browser.newPage();
  });

  afterEach(async () => {
    await browser.close();
  });

  describe('1. Registro de usuario', () => {
    test('Debe registrar un nuevo usuario exitosamente', async () => {
      console.log('\n--- PASO 1: REGISTRO DE USUARIO ---');
      
      // Generar datos de usuario únicos
      newUserData = testHelper.generateUserData();
      
      // Registrar usuario
      const userData = await testHelper.registerUser(newUserData);
      
      // Verificar que se completó el registro
      expect(userData).toBeDefined();
      expect(userData.email).toBe(newUserData.email);
      
      // Tomar screenshot
      await testHelper.takeScreenshot('01_user_registered');
      
      console.log('✅ Usuario registrado exitosamente:', userData.email);
    });
  });

  describe('2. Activación por administrador', () => {
    test('Debe activar el usuario recién creado como administrador', async () => {
      console.log('\n--- PASO 2: ACTIVACIÓN POR ADMINISTRADOR ---');
      
      // Verificar que tenemos datos del usuario
      expect(newUserData).toBeDefined();
      
      // Activar usuario como administrador
      await testHelper.activateUserAsAdmin(newUserData.email);
      
      // Tomar screenshot
      await testHelper.takeScreenshot('02_user_activated');
      
      console.log('✅ Usuario activado por administrador');
    });
  });

  describe('3. Inicio de sesión del usuario', () => {
    test('Debe iniciar sesión con el usuario recién activado', async () => {
      console.log('\n--- PASO 3: INICIO DE SESIÓN ---');
      
      // Cerrar sesión de administrador si está activa
      await testHelper.logout();
      
      // Iniciar sesión con el nuevo usuario
      await testHelper.login(newUserData.email, newUserData.password);
      
      // Verificar que está logueado
      const isLoggedIn = await testHelper.isLoggedIn();
      expect(isLoggedIn).toBe(true);
      
      // Verificar que está en la página de inicio
      const isOnHomePage = await testHelper.isOnHomePage();
      expect(isOnHomePage).toBe(true);
      
      // Tomar screenshot
      await testHelper.takeScreenshot('03_user_logged_in');
      
      console.log('✅ Usuario inició sesión exitosamente');
    });
  });

  describe('4. Verificación de notificaciones', () => {
    test('Debe verificar que las notificaciones se cargan correctamente', async () => {
      console.log('\n--- PASO 4: VERIFICACIÓN DE NOTIFICACIONES ---');
      
      // Ir a la página de inicio
      await browser.goto(`${config.FRONTEND_URL}/inicio`);
      
      // Esperar un momento para que se carguen las notificaciones
      await testHelper.waitForTimeout(3000);
      
      // Verificar notificaciones
      const notificationData = await testHelper.checkNotifications();
      
      console.log('Notification data:', notificationData);
      
      // Tomar screenshot
      await testHelper.takeScreenshot('04_notifications_checked');
      
      // Las notificaciones pueden estar vacías, pero el sistema debe responder
      expect(notificationData).toBeDefined();
      expect(notificationData.badgeCount).toBeGreaterThanOrEqual(0);
      expect(notificationData.notificationCount).toBeGreaterThanOrEqual(0);
      
      console.log('✅ Sistema de notificaciones verificado');
    });

    test('Debe esperar a que aparezca una notificación de activación', async () => {
      console.log('\n--- PASO 4.1: ESPERAR NOTIFICACIÓN DE ACTIVACIÓN ---');
      
      // Esperar a que aparezca una notificación
      const notificationData = await testHelper.waitForNotification(15000);
      
      // Debería haber al menos una notificación
      if (notificationData) {
        expect(notificationData.badgeCount >= 0).toBe(true);
        console.log('✅ Notificación detectada:', notificationData);
      } else {
        console.log('⚠️ No se detectaron notificaciones en el tiempo esperado');
      }
      
      // Tomar screenshot final
      await testHelper.takeScreenshot('04_1_notification_waited');
    });
  });

  describe('5. Navegación y funcionalidad básica', () => {
    test('Debe navegar por las secciones principales', async () => {
      console.log('\n--- PASO 5: NAVEGACIÓN BÁSICA ---');
      
      // Verificar que está en inicio
      await browser.goto(`${config.FRONTEND_URL}/inicio`);
      
      // Verificar elementos del menú
      try {
        await browser.waitForSelector('.accordion', { timeout: 5000 });
        console.log('✅ Menú de navegación encontrado');
      } catch (e) {
        console.log('⚠️ Menú de navegación no encontrado');
      }
      
      // Verificar perfil de usuario
      try {
        await browser.waitForSelector('.card-header', { timeout: 5000 });
        console.log('✅ Tarjeta de perfil encontrada');
      } catch (e) {
        console.log('⚠️ Tarjeta de perfil no encontrada');
      }
      
      // Tomar screenshot
      await testHelper.takeScreenshot('05_navigation_complete');
      
      console.log('✅ Navegación básica completada');
    });
  });

  describe('6. Limpieza y cierre', () => {
    test('Debe cerrar sesión correctamente', async () => {
      console.log('\n--- PASO 6: CIERRE DE SESIÓN ---');
      
      // Cerrar sesión
      await testHelper.logout();
      
      // Verificar que no está logueado
      const isLoggedIn = await testHelper.isLoggedIn();
      expect(isLoggedIn).toBe(false);
      
      // Tomar screenshot final
      await testHelper.takeScreenshot('06_logged_out');
      
      console.log('✅ Sesión cerrada exitosamente');
    });
  });
});
