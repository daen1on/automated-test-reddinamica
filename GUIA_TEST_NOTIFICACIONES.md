# 🔔 Guía de Tests de Notificaciones de Recursos

## 📋 Descripción

Este test verifica el sistema completo de notificaciones para recursos implementado en RedDinámica, incluyendo:

- ✅ Notificaciones al usuario cuando envía un recurso
- ✅ Notificaciones a administradores de recursos pendientes  
- ✅ Notificaciones de aprobación/rechazo
- ✅ Visibilidad automática de recursos aprobados
- ✅ Estados visuales correctos (badges)

---

## 🚀 Cómo Ejecutar

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecutar script que verifica servidores y ejecuta tests
./run-notifications-test.bat
```

### Opción 2: Comando Manual
```bash
# Ejecutar solo el test de notificaciones
npm test -- tests/resource-notifications.test.js --verbose

# Ejecutar con timeout extendido
npm test -- tests/resource-notifications.test.js --testTimeout=120000
```

### Opción 3: Modo Watch (Desarrollo)
```bash
# Ejecutar en modo watch para desarrollo
npm run test:watch -- tests/resource-notifications.test.js
```

---

## ⚙️ Requisitos Previos

### 1. Servidores Ejecutándose
- **Backend:** `http://localhost:3800` ✅
- **Frontend:** `http://localhost:4200` ✅

### 2. Usuarios de Prueba Configurados
- **Usuario Regular:** `vidagumfacilitador@test.co` / `test123`
- **Administrador:** `admin@reddinamica.com` / `admin123`

### 3. Base de Datos
- MongoDB ejecutándose y accesible
- Datos de prueba inicializados

---

## 🧪 Tests Incluidos

### 1. **Test Principal: Flujo Completo**
```javascript
test('Debe enviar notificaciones correctas al crear un recurso')
```

**Pasos verificados:**
1. 🔐 Login como usuario regular
2. 📝 Navegación a recursos
3. ➕ Apertura de modal de crear recurso
4. 📋 Llenado de formulario
5. 📤 Envío de recurso
6. 🔔 Verificación de notificación al usuario
7. 👨‍💼 Login como administrador
8. 🔔 Verificación de notificación al admin
9. ✅ Aprobación de recurso (si es posible)
10. 🔔 Verificación de notificación de aprobación
11. 👁️ Verificación de visibilidad del recurso

### 2. **Test Simplificado**
```javascript
test('Debe verificar que las notificaciones de recursos funcionen correctamente (test simplificado)')
```

**Verificaciones básicas:**
- ✅ Creación exitosa de recursos
- ✅ Existencia de notificaciones
- ✅ Visibilidad de recursos en la lista
- ✅ Estadísticas de notificaciones

### 3. **Test de Validación**
```javascript
test('Debe manejar correctamente errores en el envío de recursos')
```

**Verificaciones:**
- ✅ Validación de formularios vacíos
- ✅ Manejo de errores de envío
- ✅ Mensajes de error apropiados

### 4. **Test de Estados**
```javascript
test('Debe mostrar el estado correcto de recursos pendientes')
```

**Verificaciones:**
- ✅ Badges de "Pendiente de aprobación"
- ✅ Estados visuales correctos
- ✅ Estadísticas de notificaciones

---

## 📊 Helpers Incluidos

### NotificationHelper
Clase utilitaria que facilita las pruebas de notificaciones:

```javascript
// Esperar a que aparezca una notificación
await notificationHelper.waitForNotification(['recurso', 'enviado'], 5, 3000);

// Obtener estadísticas
const stats = await notificationHelper.getNotificationStats();

// Buscar notificaciones por palabras clave
const found = await notificationHelper.findNotificationByKeywords(['aprobado']);
```

**Métodos disponibles:**
- `goToNotifications()` - Navega a notificaciones
- `getAllNotifications()` - Obtiene todas las notificaciones
- `waitForNotification()` - Espera notificación específica
- `findNotificationByKeywords()` - Busca por palabras clave
- `getNotificationStats()` - Estadísticas completas
- `countUnreadNotifications()` - Cuenta no leídas
- `clickNotification()` - Hace clic en notificación específica

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot find element"
**Causa:** Los selectores CSS han cambiado en la interfaz
**Solución:** Actualizar los selectores en el test

### ❌ Error: "Timeout waiting for selector"
**Causa:** La página tarda más en cargar de lo esperado
**Solución:** Aumentar los timeouts en el test

### ❌ Error: "Login failed"
**Causa:** Credenciales incorrectas o usuario no existe
**Solución:** Verificar que los usuarios de prueba existan en la BD

### ❌ Error: "Server not responding"
**Causa:** Backend o frontend no están ejecutándose
**Solución:** Verificar que ambos servidores estén activos

### ❌ Error: "Notification not found"
**Causa:** Las notificaciones no se están generando correctamente
**Solución:** 
1. Verificar que el backend tenga las funciones de notificación implementadas
2. Revisar logs del servidor para errores
3. Verificar que la base de datos esté funcionando

---

## 📸 Screenshots y Logs

### Ubicación de Screenshots
Los screenshots de errores se guardan en: `screenshots/`

### Formato de Nombres
- `notification_test_error_[timestamp].png`
- `resource_creation_failed_[timestamp].png`
- `login_failed_[timestamp].png`

### Logs Detallados
Los tests incluyen logs detallados con emojis para fácil identificación:
- 🧪 Inicio de test
- 1️⃣2️⃣3️⃣ Pasos del test
- ✅ Éxito
- ❌ Error
- ⚠️ Advertencia
- 📊 Estadísticas
- 🔍 Búsqueda

---

## 🎯 Casos de Uso Verificados

### Flujo Normal
1. Usuario envía recurso → Recibe notificación "Enviado para aprobación"
2. Admin recibe notificación → "Nuevo recurso pendiente"
3. Admin aprueba → Usuario recibe "Recurso aprobado"
4. Recurso se hace visible automáticamente

### Casos Edge
- Formularios vacíos → Validación correcta
- Sesiones expiradas → Redirección a login
- Recursos pendientes → Badges correctos
- Múltiples notificaciones → Estadísticas correctas

---

## 🔧 Configuración Avanzada

### Timeouts Personalizados
```javascript
// En jest.setup.js o en el test específico
jest.setTimeout(120000); // 2 minutos para tests complejos
```

### Variables de Entorno
```bash
# Configurar URLs si son diferentes
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3800
```

### Modo Debug
```javascript
// Activar modo debug en el test
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);
```

---

## 📈 Métricas de Éxito

### Tests que Deben Pasar
- ✅ **Creación de recursos:** 100% exitosa
- ✅ **Notificaciones de usuario:** 100% detectadas
- ✅ **Notificaciones de admin:** 100% detectadas
- ✅ **Visibilidad de recursos:** 100% correcta
- ✅ **Estados visuales:** 100% apropiados

### Performance Esperada
- **Tiempo total:** < 2 minutos
- **Timeout por paso:** < 15 segundos
- **Carga de páginas:** < 10 segundos
- **Respuesta de API:** < 5 segundos

---

## 🤝 Contribuir

Para mejorar o extender estos tests:

1. **Agregar nuevos casos:** Crear nuevos `test()` blocks
2. **Mejorar helpers:** Extender `NotificationHelper`
3. **Optimizar selectores:** Usar selectores más robustos
4. **Agregar validaciones:** Más verificaciones específicas

### Estructura Recomendada
```javascript
test('Descripción clara del test', async () => {
  console.log('🧪 Iniciando test...');
  
  // Setup
  console.log('1️⃣ Setup inicial...');
  
  // Acción principal
  console.log('2️⃣ Ejecutando acción...');
  
  // Verificaciones
  console.log('3️⃣ Verificando resultados...');
  
  // Assertions
  expect(result).toBe(expected);
  console.log('✅ Test completado');
}, timeout);
```
