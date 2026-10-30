# Flask CRUD API — Usuarios en Memoria

Proyecto de demostración para el portafolio personal.  
Una API REST completa hecha en **Python + Flask** que gestiona usuarios con almacenamiento **en memoria** (sin base de datos).

---

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | /health | Estado del servidor |
| GET | /api/users | Lista todos los usuarios |
| POST | /api/users | Crea un usuario nuevo |
| GET | /api/users/<id> | Obtiene un usuario |
| PUT | /api/users/<id> | Actualiza un usuario |
| DELETE | /api/users/<id> | Elimina un usuario |

## Estructura de un Usuario

`json
{
  "id": "uuid-generado-automaticamente",
  "nombre": "Ana García",
  "email": "ana@example.com",
  "telefono": "+591 712 34567",
  "creado_en": "2024-01-01T00:00:00Z"
}
`

## Cómo ejecutar

`ash
# 1. Ir a la carpeta
cd flask-crud

# 2. Crear entorno virtual (opcional pero recomendado)
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar
python app.py
`

El servidor corre en **http://localhost:5000**

## Ejemplos con curl

`ash
# Listar usuarios
curl http://localhost:5000/api/users

# Crear usuario
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@test.com","telefono":"123456"}'

# Actualizar usuario
curl -X PUT http://localhost:5000/api/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Nuevo","email":"juan@test.com","telefono":"654321"}'

# Eliminar usuario
curl -X DELETE http://localhost:5000/api/users/<id>
`

## Tecnologías

- **Python 3.10+**
- **Flask 3** — micro-framework web
- **Flask-CORS** — habilita peticiones desde el portafolio React
- **uuid** — generación de IDs únicos (módulo estándar de Python)

> ⚠️ Los datos se almacenan **solo en memoria**. Al reiniciar el servidor se pierden (excepto los 2 usuarios de ejemplo).
