# Guía de Tests Automatizados - Lecciones y Experiencias

## Fecha: 21 de Septiembre, 2025

Esta guía describe cómo ejecutar y entender los tests automatizados para los sistemas de sugerencias de lecciones y envío de experiencias.

---

## 📋 Tests Implementados

### 1. Tests de Sugerencias de Lecciones (`suggest-lesson-notifications.test.js`)

#### Casos de Prueba:
- ✅ **Sugerencia con 1 área y 1 nivel**: Verifica el flujo básico de notificaciones
- ✅ **Sugerencia con múltiples áreas y niveles**: Verifica selección múltiple y facilitador sugerido
- ⚠️ **Aprobación de sugerencia**: Pendiente de implementación completa del panel admin

#### Verificaciones:
- Usuario recibe notificación de confirmación
- Administradores reciben notificación de nueva sugerencia
- Facilitador sugerido recibe invitación (cuando aplica)
- Contenido de notificaciones es correcto
- Títulos y tipos se muestran correctamente

### 2. Tests de Envío de Experiencias (`send-experience-notifications.test.js`)

#### Casos de Prueba:
- ✅ **Experiencia tipo "Consideración" con 1 área y 1 nivel**: Verifica flujo sin facilitador
- ✅ **Experiencia tipo "Desarrollo" con múltiples áreas y niveles**: Verifica flujo con facilitador
- ⚠️ **Aprobación de experiencia**: Pendiente de implementación del panel admin
- ⚠️ **Rechazo de experiencia**: Pendiente de implementación del panel admin

#### Verificaciones:
- Campo de facilitador aparece/desaparece según el tipo
- Usuario recibe notificación de confirmación
- Administradores reciben notificación de nueva experiencia
- Facilitador recibe invitación (solo para tipo "Desarrollo")
- Contenido incluye tipo de experiencia correctamente

---

## 🚀 Cómo Ejecutar los Tests

### Prerrequisitos:

1. **Servidores ejecutándose**:
   ```bash
   # Terminal 1 - Frontend Angular
   cd redDinamica-client
   npm run start
   
   # Terminal 2 - Backend Node.js
   cd RedDinamica2-api
   npm run dev
   ```

2. **Base de datos configurada** con usuarios de prueba:
   - `vidagumfacilitador@test.co` / `test123` (Usuario regular)
   - `admin@test.co` / `admin123` (Administrador)
   - `facilitador@test.co` / `facilitador123` (Facilitador)

### Ejecución:

#### Opción 1: Ejecutar todos los tests de lecciones
```bash
cd automated-test-reddinamica
./run-lesson-tests.bat
```

#### Opción 2: Ejecutar tests individuales
```bash
# Solo tests de sugerencias
npx jest tests/suggest-lesson-notifications.test.js --verbose

# Solo tests de experiencias  
npx jest tests/send-experience-notifications.test.js --verbose
```

#### Opción 3: Ejecutar con configuración específica
```bash
# Con timeout extendido
npx jest tests/suggest-lesson-notifications.test.js --testTimeout=180000

# Con modo debug
npx jest tests/suggest-lesson-notifications.test.js --verbose --detectOpenHandles
```

---

## 🔍 Estructura de los Tests

### Configuración Común:

```javascript
beforeAll(async () => {
  // Configurar múltiples navegadores
  browserHelper = new BrowserHelper();
  adminBrowserHelper = new BrowserHelper();
  facilitatorBrowserHelper = new BrowserHelper();
  
  // Lanzar navegadores
  await browserHelper.launch();
  await adminBrowserHelper.launch();
  await facilitatorBrowserHelper.launch();
  
  // Configurar helpers de notificaciones
  userNotificationHelper = new NotificationHelper(browserHelper);
  adminNotificationHelper = new NotificationHelper(adminBrowserHelper);
  facilitatorNotificationHelper = new NotificationHelper(facilitatorBrowserHelper);
});
```

### Flujo Típico de Test:

1. **Login de usuarios** (usuario, admin, facilitador)
2. **Obtener conteo inicial** de notificaciones
3. **Navegar y abrir modal** correspondiente
4. **Llenar formulario** con datos de prueba
5. **Seleccionar áreas y niveles** usando autocompletado
6. **Configurar opciones específicas** (tipo, facilitador)
7. **Enviar formulario** y verificar éxito
8. **Verificar notificaciones** en cada usuario
9. **Validar contenido** de las notificaciones
10. **Tomar screenshots** para evidencia

---

## 📊 Casos de Prueba Detallados

### Test 1: Sugerencia con 1 área y 1 nivel

```javascript
test('Debe enviar notificaciones correctas al sugerir lección con 1 área y 1 nivel', async () => {
  // Configuración de datos
  const lessonTitle = `Lección de Prueba Automatizada ${timestamp}`;
  
  // Selecciones
  - Área: "Matemáticas" (1 sola)
  - Nivel: "Universitario" (1 solo)
  - Facilitador: No seleccionado
  
  // Verificaciones esperadas
  ✅ Usuario recibe: "Sugerencia de lección enviada"
  ✅ Admin recibe: "Nueva sugerencia de lección"
  ✅ Contenido incluye título de la lección
  ❌ Facilitador NO recibe notificación
});
```

### Test 2: Sugerencia con múltiples áreas y niveles

```javascript
test('Debe enviar notificaciones correctas al sugerir lección con múltiples áreas y niveles', async () => {
  // Configuración de datos
  const lessonTitle = `Lección Múltiple Automatizada ${timestamp}`;
  
  // Selecciones
  - Áreas: "Matemáticas", "Física", "Química" (múltiples)
  - Niveles: "Secundaria", "Universitario", "Posgrado" (múltiples)
  - Facilitador: Primer facilitador disponible
  
  // Verificaciones esperadas
  ✅ Usuario recibe: "Sugerencia de lección enviada"
  ✅ Admin recibe: "Nueva sugerencia de lección"
  ✅ Facilitador recibe: "Te han sugerido como facilitador"
  ✅ Contenido incluye título y múltiples selecciones
});
```

### Test 3: Experiencia tipo "Consideración"

```javascript
test('Debe enviar notificaciones correctas al enviar experiencia tipo "Consideración"', async () => {
  // Configuración de datos
  const experienceTitle = `Experiencia Consideración Automatizada ${timestamp}`;
  
  // Selecciones
  - Tipo: "Consideración"
  - Área: "Educación" (1 sola)
  - Nivel: "Secundaria" (1 solo)
  - Facilitador: Campo NO visible
  
  // Verificaciones esperadas
  ✅ Campo facilitador está oculto
  ✅ Usuario recibe: "Experiencia enviada para revisión"
  ✅ Admin recibe: "Nueva experiencia enviada"
  ✅ Contenido incluye tipo "Consideración"
  ❌ Facilitador NO recibe notificación
});
```

### Test 4: Experiencia tipo "Desarrollo"

```javascript
test('Debe enviar notificaciones correctas al enviar experiencia tipo "Desarrollo"', async () => {
  // Configuración de datos
  const experienceTitle = `Experiencia Desarrollo Múltiple ${timestamp}`;
  
  // Selecciones
  - Tipo: "Desarrollo"
  - Áreas: "Ingeniería", "Tecnología", "Sistemas" (múltiples)
  - Niveles: "Bachillerato", "Universitario" (múltiples)
  - Facilitador: Primer facilitador disponible
  
  // Verificaciones esperadas
  ✅ Campo facilitador está visible
  ✅ Usuario recibe: "Experiencia enviada para revisión"
  ✅ Admin recibe: "Nueva experiencia enviada"
  ✅ Facilitador recibe: "Te han sugerido como facilitador de una experiencia"
  ✅ Contenido incluye tipo "Desarrollo"
});
```

---

## 🛠️ Helpers Utilizados

### BrowserHelper
- Manejo de navegadores Puppeteer
- Navegación y interacciones con elementos
- Screenshots automáticos
- Logging de requests/responses

### NotificationHelper
- Conteo de notificaciones
- Verificación de títulos específicos
- Extracción de contenido
- Validación de notificaciones

---

## 📸 Screenshots Generados

Los tests generan screenshots automáticamente con nombres descriptivos:

```
screenshots/
├── suggest-lesson-1area-1level-user-[timestamp].png
├── suggest-lesson-1area-1level-admin-[timestamp].png
├── suggest-lesson-multiple-user-[timestamp].png
├── suggest-lesson-multiple-admin-[timestamp].png
├── suggest-lesson-multiple-facilitator-[timestamp].png
├── send-experience-consideracion-1area-1level-user-[timestamp].png
├── send-experience-consideracion-1area-1level-admin-[timestamp].png
├── send-experience-desarrollo-multiple-user-[timestamp].png
├── send-experience-desarrollo-multiple-admin-[timestamp].png
└── send-experience-desarrollo-multiple-facilitator-[timestamp].png
```

---

## ⚠️ Limitaciones Actuales

### Tests Pendientes:
1. **Aprobación de sugerencias**: Requiere panel de administración completo
2. **Rechazo de sugerencias**: Requiere panel de administración completo
3. **Aprobación de experiencias**: Requiere panel de administración completo
4. **Rechazo de experiencias**: Requiere panel de administración completo

### Dependencias:
- Panel de administración funcional para lecciones/experiencias
- Usuarios de prueba configurados en la base de datos
- Servidores frontend y backend ejecutándose
- Base de datos con datos de prueba (áreas, niveles, usuarios)

---

## 🔧 Configuración de Usuarios de Prueba

Para que los tests funcionen correctamente, necesitas estos usuarios en tu base de datos:

```javascript
// Usuario regular
{
  email: "vidagumfacilitador@test.co",
  password: "test123", // hasheado
  role: "user",
  name: "Usuario",
  surname: "Prueba"
}

// Administrador
{
  email: "admin@test.co", 
  password: "admin123", // hasheado
  role: "admin",
  name: "Admin",
  surname: "Prueba"
}

// Facilitador
{
  email: "facilitador@test.co",
  password: "facilitador123", // hasheado
  role: "expert", // o "facilitator"
  name: "Facilitador", 
  surname: "Prueba"
}
```

---

## 📝 Interpretación de Resultados

### ✅ Test Exitoso:
```
✓ Debe enviar notificaciones correctas al sugerir lección con 1 área y 1 nivel (45678ms)
```

### ❌ Test Fallido:
```
✗ Debe enviar notificaciones correctas al sugerir lección con 1 área y 1 nivel (12345ms)
  
  expect(received).toBeGreaterThan(expected)
  Expected: 0
  Received: 0
  
  at Object.<anonymous> (tests/suggest-lesson-notifications.test.js:123:45)
```

### 🔍 Debugging:
- Revisar screenshots generados
- Verificar logs de consola
- Comprobar que los servidores estén ejecutándose
- Validar que los usuarios de prueba existan
- Verificar timeouts si los tests son lentos

---

## 🎯 Próximos Pasos

1. **Implementar panel de administración** para completar tests de aprobación/rechazo
2. **Agregar tests de integración** con base de datos
3. **Implementar tests de performance** para formularios complejos
4. **Agregar tests de accesibilidad** para modales y formularios
5. **Crear tests de regresión** para cambios futuros

---

## 📞 Soporte

Si encuentras problemas con los tests:

1. **Verificar prerrequisitos**: Servidores ejecutándose, usuarios creados
2. **Revisar logs**: Consola del navegador y terminal
3. **Comprobar screenshots**: Para ver el estado visual de los tests
4. **Validar timeouts**: Ajustar si la aplicación es lenta
5. **Verificar selectores**: Pueden cambiar con actualizaciones de UI

Los tests están diseñados para ser robustos y proporcionar información detallada sobre cualquier fallo que pueda ocurrir.
