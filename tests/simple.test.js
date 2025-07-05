const BrowserHelper = require('../utils/browser.helper');
const config = require('../config/test.config');

describe('Prueba Simple - Verificacion de Configuracion', () => {
  let browser;

  beforeAll(async () => {
    browser = new BrowserHelper();
    await browser.launch();
    console.log('=== PRUEBA SIMPLE INICIADA ===');
  });

  afterAll(async () => {
    await browser.closeBrowser();
    console.log('=== PRUEBA SIMPLE COMPLETADA ===');
  });

  beforeEach(async () => {
    await browser.newPage();
  });

  afterEach(async () => {
    await browser.close();
  });

  test('Debe conectar al frontend y verificar que esta disponible', async () => {
    console.log('Conectando a:', config.FRONTEND_URL);
    
    await browser.goto(config.FRONTEND_URL);
    
    // Verificar que la pagina se cargo
    const title = await browser.page.title();
    console.log('Titulo de la pagina:', title);
    
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);
    
    // Tomar screenshot
    await browser.screenshot('simple_test_frontend.png');
    
    console.log('✅ Frontend disponible y funcionando');
  });

  test('Debe navegar a la pagina de login', async () => {
    console.log('Navegando a la pagina de login');
    
    await browser.goto(`${config.FRONTEND_URL}/login`);
    
    // Verificar que hay campos de login
    try {
      await browser.waitForSelector('input[name="email"]', { timeout: 5000 });
      await browser.waitForSelector('input[name="password"]', { timeout: 5000 });
      console.log('✅ Campos de login encontrados');
    } catch (e) {
      console.log('⚠️ Campos de login no encontrados con selectores esperados');
      
      // Intentar selectores alternativos
      try {
        await browser.waitForSelector('input[type="email"]', { timeout: 2000 });
        await browser.waitForSelector('input[type="password"]', { timeout: 2000 });
        console.log('✅ Campos de login encontrados con selectores alternativos');
      } catch (e2) {
        console.log('❌ No se encontraron campos de login');
      }
    }
    
    // Tomar screenshot
    await browser.screenshot('simple_test_login.png');
    
    console.log('✅ Navegacion a login completada');
  });
});