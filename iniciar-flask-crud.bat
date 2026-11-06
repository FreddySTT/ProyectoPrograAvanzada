@echo off
title Flask CRUD API - Riqsi Rutas (Puerto 5551)
color 0A
echo ================================================
echo   Flask CRUD API - Riqsi Rutas & Supabase
echo   http://localhost:5551
echo ================================================
echo.

:: Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no encontrado. Instala Python 3.10+
    pause
    exit /b 1
)

:: Ir a la carpeta flask-crud
cd /d "%~dp0flask-crud"
set PORT=5551

:: Instalar dependencias si no existen
python -m pip show flask >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    python -m pip install -r requirements.txt
    echo.
)

echo Iniciando servidor Flask en puerto 5551...
echo Presiona Ctrl+C para detener.
echo.
python app.py
pause
