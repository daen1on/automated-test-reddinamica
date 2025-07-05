const config = require('../config/test.config');

class TestHelper {
  constructor(browser) {
    this.browser = browser;
  }

  // Método helper para esperar tiempo
  async waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generar datos de usuario únicos
  generateUserData() {
    const timestamp = Date.now();
    return {
      name: `Test User ${timestamp}`,
      surname: `Surname ${timestamp}`,
      email: `test.user.${timestamp}@test.com`,
      password: 'TestPassword123!',
      institution: 'Universidad Test',
      profession: 'Ingeniería',
      city: 'Bogotá'
    };
  }

  // Registrar un nuevo usuario
  async registerUser(userData = null) {
    if (!userData) {
      userData = this.generateUserData();
    }

    console.log('Registering user:', userData.email);

    await this.browser.goto(`${config.FRONTEND_URL}/registro`);
    
    // Esperar a que se cargue la página
    await this.waitForTimeout(2000);
    
    // Llenar formulario de registro usando los IDs correctos
    await this.browser.type('#name', userData.name);
    await this.browser.type('#surname', userData.surname);
    await this.browser.type('#email', userData.email);
    await this.browser.type('#password', userData.password);
    await this.browser.type('#confirmPassword', userData.password);

    // Seleccionar profesión (ng-select)
    try {
      await this.browser.waitForSelector('ng-select[formControlName="profession"]', { timeout: 2000 });
      await this.browser.click('ng-select[formControlName="profession"]');
      await this.waitForTimeout(1000);
      
      // Buscar opción o crear nueva
      const professionOption = await this.browser.page.$(`ng-option[label="${userData.profession}"]`);
      if (professionOption) {
        await professionOption.click();
      } else {
        // Si no existe, escribir el texto (ng-select permite addTag)
        await this.browser.type('ng-select[formControlName="profession"] input', userData.profession);
        await this.browser.page.keyboard.press('Enter');
      }
    } catch (e) {
      console.log('Campo profesión no encontrado:', e.message);
    }

    // Seleccionar institución (ng-select)
    try {
      await this.browser.waitForSelector('ng-select[formControlName="institution"]', { timeout: 2000 });
      await this.browser.click('ng-select[formControlName="institution"]');
      await this.waitForTimeout(1000);
      
      // Buscar opción o crear nueva
      const institutionOption = await this.browser.page.$(`ng-option[label="${userData.institution}"]`);
      if (institutionOption) {
        await institutionOption.click();
      } else {
        // Si no existe, escribir el texto (ng-select permite addTag)
        await this.browser.type('ng-select[formControlName="institution"] input', userData.institution);
        await this.browser.page.keyboard.press('Enter');
      }
    } catch (e) {
      console.log('Campo institución no encontrado:', e.message);
    }

    // Seleccionar categoría de usuario
    try {
      await this.browser.waitForSelector('#category', { timeout: 2000 });
      await this.browser.page.select('#category', 'student'); // Seleccionar estudiante por defecto
    } catch (e) {
      console.log('Campo categoría no encontrado:', e.message);
    }

    // Aceptar términos y condiciones
    try {
      await this.browser.waitForSelector('#tyc', { timeout: 2000 });
      await this.browser.click('#tyc');
    } catch (e) {
      console.log('Checkbox términos y condiciones no encontrado:', e.message);
    }

    // Enviar formulario
    await this.browser.click('button[type="submit"]');
    
    // Esperar navegación o mensaje de éxito
    await this.waitForTimeout(3000);

    console.log('User registration completed');
    return userData;
  }

  // Iniciar sesión
  async login(email, password) {
    console.log('Logging in with:', email);

    await this.browser.goto(`${config.FRONTEND_URL}/login`);
    
    await this.browser.type('#FormEmail', email);
    await this.browser.type('#FormPassword', password);
    
    await this.browser.click('button[type="submit"]');
    
    // Esperar navegación después del login
    await this.browser.waitForNavigation();
    
    console.log('Login completed');
  }

  // Cerrar sesión
  async logout() {
    console.log('Logging out');
    
    try {
      // Buscar botón de logout
      await this.browser.waitForSelector('.logout-btn', { timeout: 5000 });
      await this.browser.click('.logout-btn');
      
      // Esperar navegación
      await this.browser.waitForNavigation();
    } catch (e) {
      console.log('Logout button not found, clearing localStorage');
      
      // Navegar a una página antes de limpiar localStorage
      await this.browser.goto(`${config.FRONTEND_URL}/login`);
      await this.waitForTimeout(1000);
      
      // Limpiar localStorage de forma segura
      try {
        await this.browser.clearLocalStorage();
      } catch (storageError) {
        console.log('Could not clear localStorage:', storageError.message);
      }
    }
    
    console.log('Logout completed');
  }

  // Activar usuario como administrador
  async activateUserAsAdmin(userEmail) {
    console.log('Activating user as admin:', userEmail);

    // Hacer logout primero si hay sesión activa
    try {
      await this.logout();
    } catch (e) {
      console.log('No active session to logout');
    }

    // Esperar un momento después del logout
    await this.waitForTimeout(2000);

    // Hacer login como admin
    await this.login(config.ADMIN_CREDENTIALS.email, config.ADMIN_CREDENTIALS.password);

    // Ir a la sección de administración
    await this.browser.goto(`${config.FRONTEND_URL}/admin`);
    await this.waitForTimeout(2000);

    // Buscar sección de nuevos usuarios
    try {
      await this.browser.waitForSelector('a[href*="nuevos-usuarios"]', { timeout: 5000 });
      await this.browser.click('a[href*="nuevos-usuarios"]');
    } catch (e) {
      console.log('Link to new users not found, trying alternative navigation');
      await this.browser.goto(`${config.FRONTEND_URL}/admin/nuevos-usuarios`);
    }

    // Buscar el usuario por email y activarlo
    await this.waitForTimeout(3000);
    
    try {
      // Buscar el usuario en la tabla
      const userRow = await this.browser.page.evaluateHandle((email) => {
        const rows = document.querySelectorAll('tr');
        for (let row of rows) {
          if (row.textContent.includes(email)) {
            return row;
          }
        }
        return null;
      }, userEmail);

      if (userRow) {
        // Buscar botón de activar en esa fila
        const activateButton = await userRow.evaluateHandle((row) => {
          return row.querySelector('.activate-btn, .btn-success, button[title*="Activar"]');
        });

        if (activateButton) {
          await activateButton.click();
          console.log('User activated successfully');
        } else {
          console.log('Activate button not found');
        }
      } else {
        console.log('User not found in new users list');
      }
    } catch (e) {
      console.log('Error during user activation:', e.message);
    }

    await this.waitForTimeout(2000);
    
    // Hacer logout del admin
    await this.logout();
  }

  // Verificar notificaciones
  async checkNotifications() {
    console.log('Checking notifications');

    // Buscar dropdown de notificaciones con selectores correctos
    const notificationSelectors = [
      '#notificationDropdown',
      'a[id="notificationDropdown"]',
      '.nav-link[data-bs-toggle="dropdown"]',
      'a[role="button"][data-bs-toggle="dropdown"]'
    ];

    for (let selector of notificationSelectors) {
      try {
        await this.browser.waitForSelector(selector, { timeout: 2000 });
        
        // Verificar badge de notificaciones
        const badge = await this.browser.page.$('.badge.rounded-pill.bg-danger');
        const badgeText = badge ? await this.browser.page.evaluate(el => el.textContent, badge) : '0';
        
        console.log('Notification badge count:', badgeText);
        
        // Hacer clic en el dropdown
        await this.browser.click(selector);
        
        // Esperar a que se carguen las notificaciones
        await this.waitForTimeout(2000);
        
        // Contar notificaciones dentro del componente app-notifications
        const notifications = await this.browser.page.$$('app-notifications .notification-item, app-notifications .list-group-item');
        console.log('Number of notifications:', notifications.length);
        
        return {
          badgeCount: parseInt(badgeText) || 0,
          notificationCount: notifications.length
        };
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    console.log('Notifications dropdown not found');
    return {
      badgeCount: 0,
      notificationCount: 0
    };
  }

  // Esperar a que aparezca una notificación
  async waitForNotification(timeout = 10000) {
    console.log('Waiting for notification to appear');
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const notificationData = await this.checkNotifications();
      
      if (notificationData.badgeCount > 0 || notificationData.notificationCount > 0) {
        console.log('Notification appeared!');
        return notificationData;
      }
      
      await this.waitForTimeout(1000);
    }
    
    console.log('Timeout waiting for notification');
    return null;
  }

  // Tomar screenshot con timestamp
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    await this.browser.screenshot(filename);
    return filename;
  }

  // Verificar si el usuario está logueado
  async isLoggedIn() {
    try {
      // Navegar a la página de inicio primero si no estamos allí
      const currentUrl = await this.browser.page.url();
      if (!currentUrl.includes('/inicio')) {
        await this.browser.goto(`${config.FRONTEND_URL}/inicio`);
        await this.waitForTimeout(1000);
      }
      
      const token = await this.browser.getLocalStorage('token');
      const identity = await this.browser.getLocalStorage('identity');
      
      return !!(token && identity);
    } catch (e) {
      console.log('Error checking login status:', e.message);
      return false;
    }
  }

  // Verificar si estamos en la página de inicio
  async isOnHomePage() {
    const url = await this.browser.page.url();
    return url.includes('/inicio');
  }

  // Verificar si estamos en la página de admin
  async isOnAdminPage() {
    const url = await this.browser.page.url();
    return url.includes('/admin');
  }
}

module.exports = TestHelper;
