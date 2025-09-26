const puppeteer = require('puppeteer');
const config = require('../config/test.config');

class BrowserHelper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch() {
    if (this.browser) {
      return this.browser;
    }

    this.browser = await puppeteer.launch(config.PUPPETEER_CONFIG);
    console.log('Browser launched');
    return this.browser;
  }

  async newPage() {
    if (!this.browser) {
      await this.launch();
    }

    this.page = await this.browser.newPage();
    
    // Configurar viewport
    await this.page.setViewport({ width: 1366, height: 768 });
    
    // Configurar user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Interceptar requests para logs
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        console.log(`API Request: ${request.method()} ${request.url()}`);
      }
      request.continue();
    });

    // Interceptar responses para logs
    this.page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });

    // Interceptar errores de consola
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`Browser Console Error: ${msg.text()}`);
      }
    });

    return this.page;
  }

  async goto(url, options = {}) {
    if (!this.page) {
      await this.newPage();
    }

    const defaultOptions = {
      waitUntil: 'networkidle2',
      timeout: config.TIMEOUTS.NAVIGATION
    };

    console.log(`Navigating to: ${url}`);
    return await this.page.goto(url, { ...defaultOptions, ...options });
  }

  async waitForSelector(selector, options = {}) {
    const defaultOptions = {
      timeout: config.TIMEOUTS.ELEMENT_WAIT,
      visible: true
    };

    console.log(`Waiting for selector: ${selector}`);
    return await this.page.waitForSelector(selector, { ...defaultOptions, ...options });
  }

  async type(selector, text, options = {}) {
    await this.waitForSelector(selector);
    await this.page.focus(selector);
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('KeyA');
    await this.page.keyboard.up('Control');
    await this.page.type(selector, text, options);
    console.log(`Typed "${text}" into ${selector}`);
  }

  async click(selector, options = {}) {
    await this.waitForSelector(selector);
    await this.page.click(selector, options);
    console.log(`Clicked: ${selector}`);
  }

  async waitForNavigation(options = {}) {
    const defaultOptions = {
      waitUntil: 'networkidle2',
      timeout: config.TIMEOUTS.NAVIGATION
    };

    console.log('Waiting for navigation...');
    return await this.page.waitForNavigation({ ...defaultOptions, ...options });
  }

  async screenshot(filename) {
    if (!this.page) return;
    
    const path = `screenshots/${filename}`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`Screenshot saved: ${path}`);
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Browser closed');
    }
  }

  async evaluate(fn, ...args) {
    if (!this.page) {
      throw new Error('No page available');
    }
    return await this.page.evaluate(fn, ...args);
  }

  async getLocalStorage(key) {
    return await this.evaluate((key) => {
      return localStorage.getItem(key);
    }, key);
  }

  async setLocalStorage(key, value) {
    return await this.evaluate((key, value) => {
      localStorage.setItem(key, value);
    }, key, value);
  }

  async clearLocalStorage() {
    return await this.evaluate(() => {
      localStorage.clear();
    });
  }

  async waitForTimeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getText(selector) {
    await this.waitForSelector(selector);
    const text = await this.page.$eval(selector, el => el.textContent.trim());
    console.log(`Got text from ${selector}: ${text}`);
    return text;
  }

  async select(selector, value) {
    await this.waitForSelector(selector);
    await this.page.select(selector, value);
    console.log(`Selected "${value}" in ${selector}`);
  }
}

module.exports = BrowserHelper;
