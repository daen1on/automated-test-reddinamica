/**
 * Helper para pruebas de notificaciones
 * Proporciona métodos útiles para verificar notificaciones en las pruebas
 */

class NotificationHelper {
  constructor(browserHelper) {
    this.browserHelper = browserHelper;
  }

  /**
   * Navega a la página de notificaciones y espera a que carguen
   */
  async goToNotifications() {
    await this.browserHelper.goto('http://localhost:4200/inicio/notificaciones');
    await this.browserHelper.waitForSelector('.notification-item, .card, .alert', { timeout: 10000 });
    await this.browserHelper.waitForTimeout(2000); // Esperar a que se rendericen completamente
  }

  /**
   * Obtiene todas las notificaciones visibles en la página
   * @returns {Promise<string[]>} Array de textos de notificaciones
   */
  async getAllNotifications() {
    try {
      const notifications = await this.browserHelper.page.$$eval(
        '.notification-item, .card-body, .alert', 
        elements => {
          return elements.map(el => el.textContent.trim()).filter(text => text.length > 0);
        }
      );
      return notifications;
    } catch (error) {
      console.log('⚠️ No se encontraron notificaciones o error al obtenerlas:', error.message);
      return [];
    }
  }

  /**
   * Busca una notificación específica por palabras clave
   * @param {string[]} keywords - Palabras clave a buscar
   * @returns {Promise<boolean>} True si encuentra la notificación
   */
  async findNotificationByKeywords(keywords) {
    const notifications = await this.getAllNotifications();
    
    return notifications.some(notification => {
      const notificationLower = notification.toLowerCase();
      return keywords.every(keyword => notificationLower.includes(keyword.toLowerCase()));
    });
  }

  /**
   * Espera a que aparezca una notificación específica (con reintentos)
   * @param {string[]} keywords - Palabras clave a buscar
   * @param {number} maxAttempts - Número máximo de intentos
   * @param {number} delayMs - Delay entre intentos en millisegundos
   * @returns {Promise<boolean>}
   */
  async waitForNotification(keywords, maxAttempts = 5, delayMs = 3000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Buscando notificación (intento ${attempt}/${maxAttempts}):`, keywords);
      
      await this.goToNotifications();
      const found = await this.findNotificationByKeywords(keywords);
      
      if (found) {
        console.log('✅ Notificación encontrada:', keywords);
        return true;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Esperando ${delayMs}ms antes del siguiente intento...`);
        await this.browserHelper.waitForTimeout(delayMs);
      }
    }
    
    console.log('❌ Notificación no encontrada después de todos los intentos:', keywords);
    const allNotifications = await this.getAllNotifications();
    console.log('📋 Notificaciones actuales:', allNotifications);
    return false;
  }

  /**
   * Cuenta las notificaciones no leídas
   * @returns {Promise<number>}
   */
  async countUnreadNotifications() {
    try {
      const unreadCount = await this.browserHelper.page.$$eval(
        '.notification-item:not(.read), .badge-danger, .notification-unread',
        elements => elements.length
      );
      return unreadCount;
    } catch (error) {
      console.log('⚠️ Error al contar notificaciones no leídas:', error.message);
      return 0;
    }
  }

  /**
   * Verifica si existe el indicador de notificaciones en la navbar
   * @returns {Promise<boolean>}
   */
  async hasNotificationIndicator() {
    try {
      await this.browserHelper.goto('http://localhost:4200/inicio');
      const indicator = await this.browserHelper.page.$('.notification-indicator, .badge, .fa-bell');
      return indicator !== null;
    } catch (error) {
      console.log('⚠️ Error al verificar indicador de notificaciones:', error.message);
      return false;
    }
  }

  /**
   * Hace clic en una notificación específica
   * @param {string[]} keywords - Palabras clave para identificar la notificación
   * @returns {Promise<boolean>} True si encontró y hizo clic en la notificación
   */
  async clickNotification(keywords) {
    await this.goToNotifications();
    
    try {
      const notificationElements = await this.browserHelper.page.$$('.notification-item, .card');
      
      for (let element of notificationElements) {
        const text = await element.evaluate(el => el.textContent.trim().toLowerCase());
        const hasAllKeywords = keywords.every(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasAllKeywords) {
          await element.click();
          console.log('✅ Clic realizado en notificación:', keywords);
          return true;
        }
      }
      
      console.log('❌ No se encontró notificación para hacer clic:', keywords);
      return false;
    } catch (error) {
      console.log('⚠️ Error al hacer clic en notificación:', error.message);
      return false;
    }
  }

  /**
   * Verifica que una notificación tenga el enlace correcto
   * @param {string[]} keywords - Palabras clave para identificar la notificación
   * @param {string} expectedUrl - URL esperada
   * @returns {Promise<boolean>}
   */
  async verifyNotificationLink(keywords, expectedUrl) {
    await this.goToNotifications();
    
    try {
      const notificationElements = await this.browserHelper.page.$$('.notification-item a, .card a');
      
      for (let element of notificationElements) {
        const text = await element.evaluate(el => el.textContent.trim().toLowerCase());
        const hasAllKeywords = keywords.every(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasAllKeywords) {
          const href = await element.evaluate(el => el.href);
          const isCorrectLink = href.includes(expectedUrl);
          
          console.log(`🔗 Enlace de notificación: ${href}`);
          console.log(`✅ Enlace correcto: ${isCorrectLink}`);
          
          return isCorrectLink;
        }
      }
      
      console.log('❌ No se encontró notificación con enlace:', keywords);
      return false;
    } catch (error) {
      console.log('⚠️ Error al verificar enlace de notificación:', error.message);
      return false;
    }
  }

  /**
   * Limpia todas las notificaciones (si existe esa funcionalidad)
   * @returns {Promise<boolean>}
   */
  async clearAllNotifications() {
    await this.goToNotifications();
    
    try {
      const clearButton = await this.browserHelper.page.$('.clear-all, .mark-all-read, [data-action="clear"]');
      if (clearButton) {
        await clearButton.click();
        await this.browserHelper.waitForTimeout(1000);
        console.log('✅ Notificaciones limpiadas');
        return true;
      }
      
      console.log('ℹ️ No se encontró botón para limpiar notificaciones');
      return false;
    } catch (error) {
      console.log('⚠️ Error al limpiar notificaciones:', error.message);
      return false;
    }
  }

  /**
   * Obtiene el número total de notificaciones
   * @returns {Promise<number>}
   */
  async getNotificationCount() {
    await this.goToNotifications();
    const notifications = await this.getAllNotifications();
    return notifications.length;
  }

  /**
   * Verifica si existe una notificación con un título específico
   * @param {string} title - Título a buscar
   * @returns {Promise<boolean>}
   */
  async hasNotificationWithTitle(title) {
    await this.goToNotifications();
    const notifications = await this.getAllNotifications();
    return notifications.some(notification => 
      notification.toLowerCase().includes(title.toLowerCase())
    );
  }

  /**
   * Obtiene el contenido de una notificación específica por título
   * @param {string} title - Título de la notificación a buscar
   * @returns {Promise<string>}
   */
  async getNotificationContent(title) {
    await this.goToNotifications();
    const notifications = await this.getAllNotifications();
    const notification = notifications.find(notification => 
      notification.toLowerCase().includes(title.toLowerCase())
    );
    return notification || '';
  }

  /**
   * Obtiene estadísticas de notificaciones para debugging
   * @returns {Promise<Object>}
   */
  async getNotificationStats() {
    await this.goToNotifications();
    
    const stats = {
      total: 0,
      unread: 0,
      types: {},
      recent: []
    };
    
    try {
      const notifications = await this.getAllNotifications();
      stats.total = notifications.length;
      stats.recent = notifications.slice(0, 5); // Las 5 más recientes
      
      // Contar no leídas
      stats.unread = await this.countUnreadNotifications();
      
      // Analizar tipos de notificaciones
      notifications.forEach(notification => {
        const notificationLower = notification.toLowerCase();
        if (notificationLower.includes('recurso')) {
          stats.types.resource = (stats.types.resource || 0) + 1;
        } else if (notificationLower.includes('mensaje')) {
          stats.types.message = (stats.types.message || 0) + 1;
        } else if (notificationLower.includes('lección')) {
          stats.types.lesson = (stats.types.lesson || 0) + 1;
        } else {
          stats.types.other = (stats.types.other || 0) + 1;
        }
      });
      
    } catch (error) {
      console.log('⚠️ Error al obtener estadísticas:', error.message);
    }
    
    return stats;
  }
}

module.exports = NotificationHelper;
