// Jest setup file

// Configuracion global para todas las pruebas
jest.setTimeout(60000); // 60 segundos timeout

// Configurar variables de entorno por defecto
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
process.env.BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3800';

// Configurar console para mejor debugging
const originalConsoleLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalConsoleLog(`[${timestamp}]`, ...args);
};

// Configurar manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configurar Jest para ignorar ciertos warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filtrar warnings conocidos que no son importantes
  const message = args.join(' ');
  if (message.includes('deprecated') || message.includes('experimental')) {
    return;
  }
  originalConsoleWarn(...args);
};