# Agentes de IA Utilizados en el Proyecto

## Información del Estudiante
- **Nombre:** Diego Molina
- **Usuario GitHub:** juandiegoM1
- **Email:** juan.molina0234@gmail.com

## Agentes de IA Utilizados

### 1. Devin (Agente CLI)
- **Descripción:** Devin es un agente de línea de comandos (CLI) asistido por IA de Cognition.
- **Función:** Interfaz principal que permite interactuar con el código, ejecutar comandos, leer archivos, editar código y gestionar el proyecto.
- **Características:**
  - Acceso a herramientas de línea de comandos
  - Lectura y edición de archivos
  - Gestión de dependencias (npm, git)
  - Navegación por el códigobase
  - Ejecución de servidores de desarrollo

### 2. SWE-1.6 Slow (Modelo de IA)
- **Descripción:** Modelo de IA optimizado para tareas de ingeniería de software (Software Engineering).
- **Función:** Es el "cerebro" que procesa las solicitudes, analiza el código, toma decisiones y genera las respuestas.
- **Características:**
  - Especializado en programación y desarrollo de software
  - Capacidad de razonamiento sobre código
  - Análisis de arquitectura y patrones
  - Generación de código funcional
  - Depuración y resolución de problemas

## Funcionalidades Implementadas con los Agentes

### Mapa Interactivo con Geolocalización
- **Agente Responsable:** Devin + SWE-1.6 Slow
- **Tareas Realizadas:**
  - Instalación de dependencias (mapbox-gl, @types/mapbox-gl)
  - Creación del componente MapView con React
  - Implementación de geolocalización en tiempo real
  - Configuración de filtros por categoría
  - Integración con el sistema de navegación de la aplicación
  - Gestión segura de tokens de API

## Ventajas de Usar Estos Agentes

1. **Automatización de tareas repetitivas:** Instalación de dependencias, configuración de archivos
2. **Análisis contextual:** Los agentes entienden el contexto completo del proyecto
3. **Iteración rápida:** Posibilidad de probar, corregir y mejorar código rápidamente
4. **Documentación automática:** Los agentes pueden explicar y documentar el código
5. **Seguridad:** Gestión adecuada de secretos y configuración (ej: tokens de API)

## Notas Técnicas

- Los agentes respetan las convenciones del proyecto existente
- Se integran con herramientas como git, npm, y Vite
- Mantienen el estilo de código y patrones establecidos
- Los commits se realizan con las credenciales del usuario

---
