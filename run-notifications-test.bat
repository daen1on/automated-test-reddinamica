@echo off
echo ================================================
echo 🧪 EJECUTANDO TESTS DE NOTIFICACIONES DE RECURSOS
echo ================================================
echo.

echo 📋 Verificando que los servidores estén ejecutándose...
echo.

:: Verificar que el backend esté ejecutándose
echo 🔍 Verificando backend (puerto 3800)...
curl -s http://localhost:3800 >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: El backend no está ejecutándose en http://localhost:3800
    echo 💡 Por favor, inicia el servidor backend antes de ejecutar los tests
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Backend detectado en http://localhost:3800
)

:: Verificar que el frontend esté ejecutándose
echo 🔍 Verificando frontend (puerto 4200)...
curl -s http://localhost:4200 >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: El frontend no está ejecutándose en http://localhost:4200
    echo 💡 Por favor, inicia el servidor frontend antes de ejecutar los tests
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Frontend detectado en http://localhost:4200
)

echo.
echo 🚀 Iniciando tests de notificaciones de recursos...
echo.

:: Ejecutar el test específico de notificaciones
npm test -- tests/resource-notifications.test.js --verbose

echo.
if errorlevel 1 (
    echo ❌ Los tests fallaron. Revisa los logs arriba para más detalles.
    echo.
    echo 🔧 Posibles causas:
    echo    - Los servidores no están ejecutándose correctamente
    echo    - Las credenciales de prueba no son válidas
    echo    - Cambios en la interfaz que requieren actualizar los selectores
    echo    - Problemas de conectividad con la base de datos
    echo.
) else (
    echo ✅ ¡Todos los tests de notificaciones pasaron exitosamente!
    echo.
    echo 📊 Resumen de funcionalidades verificadas:
    echo    ✅ Envío de recursos y notificación al usuario
    echo    ✅ Notificación a administradores de recursos pendientes
    echo    ✅ Flujo de aprobación de recursos
    echo    ✅ Estados visuales correctos (badges)
    echo    ✅ Visibilidad automática de recursos aprobados
    echo.
)

echo 📸 Los screenshots de errores (si los hay) se guardan en: screenshots/
echo.
echo ================================================
echo 🎯 TESTS DE NOTIFICACIONES COMPLETADOS
echo ================================================

pause
