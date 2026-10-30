@echo off
title Flask CRUD API - Usuarios en Memoria
color 0A
echo ================================================
echo   Flask CRUD API - Usuarios en Memoria
echo   http://localhost:5000
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

:: Instalar dependencias si no existen
pip show flask >nul 2>&1
if errorlevel 1 (
    echo Instalando dependencias...
    pip install -r requirements.txt
    echo.
)

echo Iniciando servidor Flask...
echo Presiona Ctrl+C para detener.
echo.
python app.py
pause
