@echo off
echo ========================================
echo  EJECUTANDO TESTS DE LECCIONES Y EXPERIENCIAS
echo ========================================
echo.

echo Verificando que los servidores estén ejecutándose...
echo - Frontend (Angular): http://localhost:4200
echo - Backend (Node.js): http://localhost:3800
echo.

echo IMPORTANTE: Asegúrate de que ambos servidores estén ejecutándose antes de continuar.
echo.
pause

echo.
echo ========================================
echo  EJECUTANDO TESTS DE SUGERENCIAS DE LECCIONES
echo ========================================
echo.

npx jest tests/suggest-lesson-notifications.test.js --verbose --detectOpenHandles

echo.
echo ========================================
echo  EJECUTANDO TESTS DE ENVÍO DE EXPERIENCIAS  
echo ========================================
echo.

npx jest tests/send-experience-notifications.test.js --verbose --detectOpenHandles

echo.
echo ========================================
echo  TESTS COMPLETADOS
echo ========================================
echo.

echo Revisa los screenshots generados en la carpeta 'screenshots/'
echo.
pause
