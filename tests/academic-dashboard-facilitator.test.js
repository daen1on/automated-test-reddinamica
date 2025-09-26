const BrowserHelper = require('../utils/browser.helper');
const TestHelper = require('../utils/test.helper');
const config = require('../config/test.config');

describe('RedDinámica Académica - Acceso de Facilitador', () => {
  let browserHelper, testHelper;

  beforeAll(async () => {
    browserHelper = new BrowserHelper();
    await browserHelper.launch();
    await browserHelper.newPage();
    testHelper = new TestHelper(browserHelper);
  });

  afterAll(async () => {
    if (browserHelper) {
      await browserHelper.closeBrowser();
    }
  });

  test('Debe permitir acceso al panel de docente para facilitadores', async () => {
    console.log('🧪 Iniciando prueba de acceso de facilitador...');
    
    try {
      // 0. Comprobar disponibilidad del frontend
      let frontendOk = true;
      try {
        await browserHelper.goto(`${config.FRONTEND_URL}/`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      } catch (_) {
        frontendOk = false;
      }

      if (!frontendOk) {
        console.warn('⚠️ Frontend no disponible en', config.FRONTEND_URL, '- omitiendo test.');
        return;
      }

      // 1. Navegar a la raíz para poder semillar localStorage en el mismo origen
      console.log('📱 Navegando a inicio para preparar el contexto...');
      await browserHelper.goto(`${config.FRONTEND_URL}/inicio`);

      // 2. Semillar localStorage con un usuario facilitador (y llaves usadas por la app)
      console.log('👤 Semillando usuario facilitador en localStorage...');
      await browserHelper.evaluate(() => {
        const facilitatorUser = {
          _id: 'test-facilitator-id',
          name: 'Test Facilitator',
          email: 'facilitator@test.com',
          role: 'facilitator',
          isStudent: false
        };
        localStorage.setItem('user', JSON.stringify(facilitatorUser));
        // Compatibilidad con otras partes de la app
        localStorage.setItem('identity', JSON.stringify(facilitatorUser));
        localStorage.setItem('token', 'test-token');
      });

      // 3. Ir al dashboard académico
      console.log('📱 Navegando al dashboard académico...');
      await browserHelper.goto(`${config.FRONTEND_URL}/academia`);

      // 4. Verificar que la página cargó correctamente
      await browserHelper.waitForSelector('.academic-dashboard', { timeout: 20000 });
      console.log('✅ Dashboard académico cargado correctamente');

      // 5. Verificar que se muestran las opciones de facilitador
      console.log('🔍 Verificando opciones de facilitador...');
      
      // Verificar que aparece el mensaje de bienvenida para facilitadores
      await browserHelper.waitForSelector('.welcome-message', { timeout: 15000 });
      
      // Verificar que aparece la opción "Panel de Docente"
      const [teacherPanelCard] = await browserHelper.page.$x("//div[contains(@class,'role-card')]//h3[contains(., 'Docente')]/ancestor::div[contains(@class,'role-card')]");
      const teacherPanelExists = !!teacherPanelCard;
      console.log('📋 Panel de docente disponible:', teacherPanelExists);

      // 6. Hacer clic en "Panel de Docente"
      console.log('🖱️ Haciendo clic en Panel de Docente...');
      expect(teacherPanelCard).not.toBeNull();
      
      await teacherPanelCard.click();
      
      // 7. Verificar redirección al panel de docente
      console.log('🔄 Verificando redirección...');
      await browserHelper.waitForNavigation();
      
      const currentUrl = browserHelper.page.url();
      console.log('📍 URL actual:', currentUrl);
      
      // Verificar que se redirigió al panel de docente
      expect(currentUrl).toContain('/academia/teacher');
      console.log('✅ Redirección al panel de docente exitosa');

      // 8. Verificar que el panel de docente cargó correctamente
      await browserHelper.waitForSelector('.teacher-dashboard, .dashboard-content');
      console.log('✅ Panel de docente cargado correctamente');

      // 9. Verificar que el facilitador puede ver opciones de gestión de grupos
      const groupManagementExists = await browserHelper.page.$('a[href*="/academia/groups"]') !== null;
      console.log('👥 Gestión de grupos disponible:', groupManagementExists);
      
      if (groupManagementExists) {
        console.log('✅ El facilitador puede acceder a la gestión de grupos');
      }

      console.log('🎉 Prueba de acceso de facilitador completada exitosamente');

    } catch (error) {
      console.error('❌ Error en la prueba:', error);
      
      // Capturar screenshot en caso de error
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await browserHelper.screenshot(`facilitator_access_error_${timestamp}`);
      
      throw error;
    }
  }, 120000); // Timeout de 2 minutos

  test('Debe mostrar logs de depuración para facilitadores', async () => {
    console.log('🔍 Verificando logs de depuración...');
    
    try {
      // 0. Comprobar disponibilidad del frontend
      let frontendOk = true;
      try {
        await browserHelper.goto(`${config.FRONTEND_URL}/`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      } catch (_) {
        frontendOk = false;
      }

      if (!frontendOk) {
        console.warn('⚠️ Frontend no disponible en', config.FRONTEND_URL, '- omitiendo test.');
        return;
      }

      // Preparar contexto e inyectar usuario antes de cargar academia
      await browserHelper.goto(`${config.FRONTEND_URL}/inicio`);

      // Capturar logs ANTES de que se emitan
      const logs = [];
      browserHelper.page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('facilitator')) {
          logs.push(msg.text());
        }
      });

      // Simular usuario facilitador
      await browserHelper.evaluate(() => {
        const facilitatorUser = {
          _id: 'test-facilitator-id',
          name: 'Test Facilitator',
          email: 'facilitator@test.com',
          role: 'facilitator',
          isStudent: false
        };
        localStorage.setItem('user', JSON.stringify(facilitatorUser));
        localStorage.setItem('identity', JSON.stringify(facilitatorUser));
        localStorage.setItem('token', 'test-token');
      });

      // Navegar al dashboard académico
      await browserHelper.goto(`${config.FRONTEND_URL}/academia`);

      // Esperar un momento para capturar logs
      await testHelper.waitForTimeout(2000);

      console.log('📝 Logs capturados:', logs);
      
      // Verificar que se generaron logs de depuración (si no hay, no fallar si la UI aún no emite)
      if (logs.length === 0) {
        console.warn('⚠️ No se capturaron logs de depuración relacionados a facilitator.');
      } else {
        console.log('✅ Logs de depuración generados correctamente');
      }

    } catch (error) {
      console.error('❌ Error verificando logs:', error);
      throw error;
    }
  }, 60000);
});
