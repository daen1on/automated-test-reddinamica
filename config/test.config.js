// Configuración de pruebas para RedDinámica
module.exports = {
  // URLs de la aplicación
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3800',
  
  // Credenciales de administrador
  ADMIN_CREDENTIALS: {
    email: process.env.ADMIN_EMAIL || 'admin@reddinamica.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  
  // Configuración de Puppeteer
  PUPPETEER_CONFIG: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    slowMo: parseInt(process.env.PUPPETEER_SLOWMO) || 0,
    devtools: process.env.PUPPETEER_DEVTOOLS === 'true',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  },
  
  // Timeouts
  TIMEOUTS: {
    NAVIGATION: 30000,
    ELEMENT_WAIT: 10000,
    FORM_SUBMIT: 15000,
    API_RESPONSE: 10000
  },
  
  // Selectores comunes
  SELECTORS: {
    // Login
    LOGIN_EMAIL: 'input[name="email"]',
    LOGIN_PASSWORD: 'input[name="password"]',
    LOGIN_SUBMIT: 'button[type="submit"]',
    
    // Registro
    REGISTER_NAME: 'input[name="name"]',
    REGISTER_SURNAME: 'input[name="surname"]',
    REGISTER_EMAIL: 'input[name="email"]',
    REGISTER_PASSWORD: 'input[name="password"]',
    REGISTER_CONFIRM_PASSWORD: 'input[name="confirmPassword"]',
    REGISTER_SUBMIT: 'button[type="submit"]',
    
    // Admin
    ADMIN_MENU: '.admin-menu',
    ADMIN_USERS: 'a[href*="/admin/usuarios"]',
    ADMIN_NEW_USERS: 'a[href*="/admin/nuevos-usuarios"]',
    ACTIVATE_USER_BUTTON: '.activate-user-btn',
    
    // Notificaciones
    NOTIFICATION_DROPDOWN: '.notification-dropdown',
    NOTIFICATION_BADGE: '.notification-badge',
    NOTIFICATION_ITEM: '.notification-item',
    
    // Navegación
    HOME_LINK: 'a[href*="/inicio"]',
    PROFILE_LINK: 'a[href*="/perfil"]',
    LOGOUT_BUTTON: '.logout-btn'
  },
  
  // Datos de prueba
  TEST_DATA: {
    NEW_USER: {
      name: 'Usuario',
      surname: 'Prueba',
      email: `test.user.${Date.now()}@test.com`,
      password: 'TestPassword123!',
      profession: 'Desarrollador',
      institution: 'Universidad Test',
      city: 'Ciudad Test'
    }
  }
};