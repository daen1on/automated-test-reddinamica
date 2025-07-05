@echo off
echo ========================================
echo   PRUEBAS AUTOMATIZADAS - REDDINAMICA
echo ========================================
echo.

echo Verificando que los servicios esten ejecutandose...
echo.

echo Verificando Frontend (localhost:4200)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:4200' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '✅ Frontend disponible' -ForegroundColor Green } catch { Write-Host '❌ ERROR: Frontend no disponible en http://localhost:4200' -ForegroundColor Red; Write-Host '   Por favor, ejecuta: ng serve' -ForegroundColor Yellow; exit 1 }"

if %errorlevel% neq 0 (
    pause
    exit /b 1
)

echo.
echo Verificando Backend (localhost:3800)...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3800' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend disponible' -ForegroundColor Green } catch { Write-Host '❌ ERROR: Backend no disponible en http://localhost:3800' -ForegroundColor Red; Write-Host '   Por favor, ejecuta: npm start (en RedDinamica2-api)' -ForegroundColor Yellow; exit 1 }"

if %errorlevel% neq 0 (
    pause
    exit /b 1
)

echo.
echo ========================================
echo   INICIANDO PRUEBAS AUTOMATIZADAS
echo ========================================
echo.

echo Ejecutando prueba simple de configuracion...
npm test -- tests/simple.test.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Prueba simple fallo
    echo    Revisa la configuracion antes de continuar
    pause
    exit /b 1
)

echo.
echo ¿Deseas ejecutar la prueba completa del ciclo de vida? (S/N)
set /p choice=
if /i "%choice%"=="S" (
    echo.
    echo Ejecutando prueba completa del ciclo de vida...
    npm test -- tests/user-lifecycle.test.js
) else (
    echo Prueba completa omitida.
)

echo.
echo ========================================
echo   PRUEBAS COMPLETADAS
echo ========================================
echo.
echo Los screenshots se encuentran en: screenshots/
echo.
pause
