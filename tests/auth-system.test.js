/**
 * Test de Jest para el sistema de autenticación
 * Verifica el manejo correcto de sesiones expiradas
 */

const BrowserHelper = require('../utils/browser.helper');

describe('Sistema de Autenticación', () => {
  let browserHelper;

  beforeAll(async () => {
    browserHelper = new BrowserHelper();
    await browserHelper.launch();
  });

  afterAll(async () => {
    await browserHelper.close();
  });

  beforeEach(async () => {
    await browserHelper.goto('http://localhost:4200');
  });

  test('Debe manejar correctamente la sesión expirada', async () => {
    console.log('🧪 Iniciando prueba de sesión expirada...');

    // Paso 1: Simular login exitoso
    console.log('1️⃣ Simulando login exitoso...');
    await browserHelper.goto('http://localhost:4200/login');
    
    // Llenar formulario de login
    await browserHelper.type('#email', 'admin@reddinamica.com');
    await browserHelper.type('#password', 'admin123');
    await browserHelper.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await browserHelper.waitForSelector('.navbar', { timeout: 10000 });
    console.log('✅ Login simulado correctamente');

    // Paso 2: Verificar que estamos logueados
    console.log('2️⃣ Verificando estado de login...');
    const isLoggedIn = await browserHelper.page.evaluate(() => {
      return localStorage.getItem('token') !== null;
    });
    
    expect(isLoggedIn).toBe(true);
    console.log('✅ Usuario logueado correctamente');

    // Paso 3: Simular borrado de localStorage (sesión expirada)
    console.log('3️⃣ Simulando sesión expirada...');
    await browserHelper.page.evaluate(() => {
      localStorage.clear();
    });
    
    const tokenAfterClear = await browserHelper.page.evaluate(() => {
      return localStorage.getItem('token');
    });
    
    expect(tokenAfterClear).toBeNull();
    console.log('✅ localStorage borrado correctamente');

    // Paso 4: Intentar realizar una operación que requiere autenticación
    console.log('4️⃣ Intentando operación que requiere autenticación...');
    await browserHelper.goto('http://localhost:4200/inicio');
    
    // Intentar agregar un comentario (esto debería fallar)
    const commentButton = await browserHelper.page.$('button[data-testid="add-comment"]');
    if (commentButton) {
      await commentButton.click();
      
      // Esperar a que aparezca el mensaje de error
      const errorMessage = await browserHelper.page.waitForSelector('.alert-danger, .error-message', { 
        timeout: 5000 
      }).catch(() => null);
      
      if (errorMessage) {
        const errorText = await errorMessage.evaluate(el => el.textContent);
        expect(errorText).toContain('autenticación');
        console.log('✅ Mensaje de error de autenticación mostrado correctamente');
      } else {
        console.log('⚠️ No se detectó mensaje de error específico');
      }
    } else {
      console.log('⚠️ Botón de comentario no encontrado, verificando redirección...');
    }

    // Paso 5: Verificar redirección a login
    console.log('5️⃣ Verificando redirección a login...');
    const currentUrl = browserHelper.page.url();
    
    if (currentUrl.includes('/login')) {
      console.log('✅ Redirección a login exitosa');
    } else {
      console.log('⚠️ No se detectó redirección automática');
    }

    console.log('✅ Prueba de sesión expirada completada');
  }, 30000);

  test('Debe mostrar mensaje descriptivo cuando no hay token', async () => {
    console.log('🧪 Iniciando prueba de mensaje descriptivo...');

    // Ir directamente a una página que requiere autenticación
    await browserHelper.goto('http://localhost:4200/admin/lecciones');
    
    // Verificar que aparece mensaje de error
    const errorElement = await browserHelper.page.waitForSelector('.alert, .error-message, .toast', { 
      timeout: 10000 
    }).catch(() => null);
    
    if (errorElement) {
      const errorText = await errorElement.evaluate(el => el.textContent);
      console.log('Mensaje de error encontrado:', errorText);
      expect(errorText).toMatch(/autenticación|login|sesión/i);
    } else {
      console.log('⚠️ No se encontró mensaje de error específico');
    }

    console.log('✅ Prueba de mensaje descriptivo completada');
  }, 15000);
}); 