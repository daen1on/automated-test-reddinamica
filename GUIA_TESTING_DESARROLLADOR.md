# 🧪 Guía de Testing para Desarrolladores - RedDinámica

Esta guía te ayudará a configurar y ejecutar las pruebas automatizadas del sistema RedDinámica.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Archivo de Configuración (.env)](#archivo-de-configuración-env)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Tipos de Pruebas Disponibles](#tipos-de-pruebas-disponibles)
5. [Comandos de Ejecución](#comandos-de-ejecución)
6. [Solución de Problemas](#solución-de-problemas)
7. [Interpretación de Resultados](#interpretación-de-resultados)
8. [Screenshots y Logs](#screenshots-y-logs)

---

## 🚀 Configuración Inicial

### Requisitos Previos

- **Node.js** versión 16 o superior
- **Frontend RedDinámica** corriendo en puerto 4200
- **Backend RedDinámica** corriendo en puerto 3800
- **Cuenta de administrador** configurada en el sistema

### Verificar Servicios

Antes de ejecutar las pruebas, asegúrate de que los servicios estén corriendo:

```bash
# Frontend (Angular)
cd redDinamica-client
npm run start

# Backend (Node.js)
cd RedDinamica2-api
npm run dev
```

---

## ⚙️ Archivo de Configuración (.env)

### Crear el archivo .env

En la carpeta `automated-test-reddinamica`, crea un archivo llamado `.env` con la siguiente configuración:

```env
# URLs de los servicios
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3800

# Credenciales del administrador
ADMIN_EMAIL=admin@reddinamica.com
ADMIN_PASSWORD=tu_password_admin

# Configuración de pruebas
HEADLESS=true
TIMEOUT=30000
SCREENSHOT_ON_FAILURE=true

# Configuración del navegador
BROWSER_WIDTH=1366
BROWSER_HEIGHT=768
```

### Descripción de Variables

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `FRONTEND_URL` | URL del frontend Angular | `http://localhost:4200` |
| `BACKEND_URL` | URL del backend API | `http://localhost:3800` |
| `ADMIN_EMAIL` | Email del usuario administrador | `admin@reddinamica.com` |
| `ADMIN_PASSWORD` | Contraseña del administrador | *(requerido)* |
| `HEADLESS` | Ejecutar sin interfaz gráfica | `true` |
| `TIMEOUT` | Timeout en milisegundos | `30000` |
| `SCREENSHOT_ON_FAILURE` | Capturar pantalla en errores | `true` |
| `BROWSER_WIDTH` | Ancho de ventana del navegador | `1366` |
| `BROWSER_HEIGHT` | Alto de ventana del navegador | `768` |

### ⚠️ Importante

- **NUNCA** subas el archivo `.env` al repositorio
- Mantén las credenciales seguras
- Usa un usuario administrador de pruebas, no de producción

---

## 📦 Instalación de Dependencias

### Primera Instalación

```bash
cd automated-test-reddinamica
npm install
```

### Si se Borra node_modules

Si por alguna razón se elimina la carpeta `node_modules`, sigue estos pasos:

```bash
# 1. Navegar a la carpeta de pruebas
cd automated-test-reddinamica

# 2. Limpiar cache de npm (opcional pero recomendado)
npm cache clean --force

# 3. Eliminar package-lock.json si existe
del package-lock.json  # Windows
rm package-lock.json   # Linux/Mac

# 4. Reinstalar todas las dependencias
npm install

# 5. Verificar instalación
npm list --depth=0
```

### Dependencias Principales

El sistema utiliza las siguientes dependencias clave:

- **Puppeteer**: Automatización del navegador
- **Jest**: Framework de pruebas
- **dotenv**: Manejo de variables de entorno

---

## 🧪 Tipos de Pruebas Disponibles

### 1. Pruebas Simples (`simple.test.js`)

**Propósito**: Verificación básica de conectividad y navegación

**Qué verifica**:
- ✅ Conexión al frontend
- ✅ Navegación a páginas principales
- ✅ Detección de elementos básicos

**Duración**: ~20 segundos

### 2. Pruebas Completas (`user-lifecycle.test.js`)

**Propósito**: Ciclo de vida completo del usuario

**Qué verifica**:
- ✅ Registro de nuevo usuario
- ✅ Activación por administrador
- ✅ Inicio de sesión
- ✅ Sistema de notificaciones
- ✅ Navegación básica
- ✅ Cierre de sesión

**Duración**: ~90 segundos

---

## 🚀 Comandos de Ejecución

### Comandos Básicos

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas simples
npm test tests/simple.test.js

# Ejecutar solo pruebas completas
npm test tests/user-lifecycle.test.js

# Ejecutar con output detallado
npm test -- --verbose

# Ejecutar en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ejecutar con cobertura de código
npm run test:coverage
```

### Scripts Especiales

```bash
# Script completo con verificaciones (Windows)
./run-tests.bat

# Ejecutar con timeout personalizado
npx jest --testTimeout=120000

# Ejecutar sin headless (ver navegador)
HEADLESS=false npm test

# Ejecutar prueba específica
npm test -- --testNamePattern="Debe registrar"
```

### Comandos Avanzados

```bash
# Ejecutar con configuración personalizada
npx jest --config=jest.config.js

# Generar reporte HTML
npm run test:coverage -- --coverageReporters=html

# Ejecutar solo pruebas que fallaron
npm test -- --onlyFailures

# Ejecutar con máximo paralelismo
npm test -- --maxWorkers=4
```

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Error: "Cannot connect to frontend"

**Causa**: Frontend no está corriendo

**Solución**:
```bash
cd redDinamica-client
ng serve
```

#### 2. Error: "Admin login failed"

**Causa**: Credenciales incorrectas en `.env`

**Solución**:
- Verificar `ADMIN_EMAIL` y `ADMIN_PASSWORD`
- Confirmar que el usuario admin existe en la BD

#### 3. Error: "Timeout exceeded"

**Causa**: Servicios lentos o sobrecargados

**Solución**:
```bash
# Aumentar timeout
npx jest --testTimeout=180000
```

#### 4. Error: "Selector not found"

**Causa**: Cambios en la interfaz de usuario

**Solución**:
- Revisar los selectores en `test.helper.js`
- Actualizar según cambios en el frontend

### Comandos de Diagnóstico

```bash
# Verificar configuración
npm run test:config

# Limpiar cache de Jest
npx jest --clearCache

# Verificar instalación de Puppeteer
npx puppeteer browsers list

# Reinstalar Puppeteer si es necesario
npm rebuild puppeteer
```

---

## 📊 Interpretación de Resultados

### Estados de Pruebas

| Estado | Símbolo | Significado |
|--------|---------|-------------|
| **PASS** | ✅ | Prueba exitosa |
| **FAIL** | ❌ | Prueba falló |
| **SKIP** | ⏭️ | Prueba omitida |
| **TODO** | 📝 | Prueba pendiente |

### Ejemplo de Salida Exitosa

```
PASS tests/simple.test.js (21.382 s)
  Prueba Simple - Verificacion de Configuracion
    ✓ Debe conectar al frontend y verificar que esta disponible (8452 ms)
    ✓ Debe navegar a la pagina de login (9605 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Time:        21.606 s
```

### Ejemplo de Salida con Errores

```
FAIL tests/user-lifecycle.test.js (94.952 s)
  RedDinámica - Ciclo de vida completo del usuario
    ✓ Debe registrar un nuevo usuario exitosamente (21581 ms)
    ✗ Debe activar el usuario recién creado como administrador (14469 ms)

  ● RedDinámica - Ciclo de vida completo del usuario › Debe activar el usuario

    TimeoutError: Waiting for selector `#FormEmail` failed: Waiting failed: 10000ms exceeded
```

---

## 📸 Screenshots y Logs

### Ubicación de Archivos

```
automated-test-reddinamica/
├── screenshots/           # Screenshots automáticos
│   ├── simple_test_frontend.png
│   ├── user_registration_complete.png
│   └── ...
├── logs/                 # Logs detallados (si configurado)
└── coverage/             # Reportes de cobertura
```

### Screenshots Automáticos

El sistema genera screenshots automáticamente en:

- ✅ **Pasos exitosos**: Documentación del flujo
- ❌ **Errores**: Evidencia del estado al fallar
- 📊 **Puntos clave**: Registro, login, notificaciones

### Interpretar Screenshots

- **Nombre del archivo**: Incluye timestamp y paso
- **Contenido**: Estado exacto de la aplicación
- **Uso**: Debugging y documentación

---

## 📝 Buenas Prácticas

### Antes de Ejecutar

1. ✅ Verificar que frontend y backend estén corriendo
2. ✅ Confirmar credenciales de administrador
3. ✅ Limpiar datos de pruebas anteriores si es necesario

### Durante el Desarrollo

1. 🔄 Ejecutar pruebas simples frecuentemente
2. 🧪 Ejecutar pruebas completas antes de commits
3. 📸 Revisar screenshots en caso de fallos

### Mantenimiento

1. 🔄 Actualizar selectores cuando cambie la UI
2. 📝 Documentar nuevos casos de prueba
3. 🧹 Limpiar screenshots antiguos periódicamente

---

## 🆘 Soporte

### Archivos de Configuración Clave

- `package.json`: Dependencias y scripts
- `jest.setup.js`: Configuración global de Jest
- `config/test.config.js`: Configuración de pruebas
- `utils/browser.helper.js`: Helper para Puppeteer
- `utils/test.helper.js`: Helper para operaciones de prueba

### Contacto

Para problemas o mejoras:

1. Revisar esta guía completa
2. Verificar logs y screenshots
3. Consultar con el equipo de desarrollo

---

## 📚 Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Documentación de Puppeteer](https://pptr.dev/)
- [Guía de Selectores CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_Selectors)

---

*Última actualización: Julio 2025*
