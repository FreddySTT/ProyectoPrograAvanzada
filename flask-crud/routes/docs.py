"""
Blueprint de Documentación OpenAPI 3.0 y Swagger UI interactivo.
Endpoints:
  - GET /api/openapi.json  -> Especificación JSON completa
  - GET /docs              -> Interfaz interactiva Swagger UI
"""
from flask import Blueprint, jsonify, render_template_string

docs_bp = Blueprint("docs", __name__)

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "Riqsi Rutas API — Cochabamba Tourism Platform",
        "version": "2.0.0",
        "description": (
            "API RESTful empresarial para la plataforma turística Riqsi Rutas de Cochabamba, Bolivia. "
            "Ofrece cálculo de rutas óptimas con Dijkstra, gestión de lugares turísticos, "
            "pasarela de reservas con idempotencia y tarifas en servidor, y autenticación JWT con roles."
        ),
        "contact": {
            "name": "Equipo Riqsi Rutas",
            "url": "https://riqsi-rutas.web.app"
        }
    },
    "servers": [
        {"url": "/", "description": "Servidor actual"},
        {"url": "http://localhost:5551", "description": "Desarrollo local Flask"}
    ],
    "components": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Token JWT con claim de rol (admin, operador, turista)."
            }
        },
        "schemas": {
            "ProblemDetails": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "example": "https://httpstatuses.com/400"},
                    "title": {"type": "string", "example": "Bad Request"},
                    "status": {"type": "integer", "example": 400},
                    "detail": {"type": "string", "example": "Descripción del error"},
                    "instance": {"type": "string", "example": "/api/users"}
                }
            },
            "DijkstraQuery": {
                "type": "object",
                "required": ["origen", "destino"],
                "properties": {
                    "origen": {"type": "string", "example": "cristo"},
                    "destino": {"type": "string", "example": "pairumani"},
                    "optimizar": {"type": "string", "enum": ["distancia_km", "tiempo_min"], "default": "distancia_km"}
                }
            },
            "CheckoutInput": {
                "type": "object",
                "required": ["tipo_reserva", "personas", "lugar_id"],
                "properties": {
                    "lugar_id": {"type": "string", "example": "place-cristo"},
                    "tipo_reserva": {"type": "string", "enum": ["basico", "estandar", "premium", "vip"]},
                    "personas": {"type": "integer", "minimum": 1, "maximum": 20, "example": 2},
                    "cupon": {"type": "string", "example": "COCHABAMBA2026"},
                    "cliente_email": {"type": "string", "format": "email", "example": "turista@riqsi.bo"},
                    "idempotency_key": {"type": "string", "example": "uuid-v4-unique-id"}
                }
            }
        }
    },
    "paths": {
        "/health": {
            "get": {
                "summary": "Healthcheck del servicio",
                "responses": {
                    "200": {"description": "Servicio saludable"}
                }
            }
        },
        "/api/places": {
            "get": {
                "summary": "Listar todos los lugares turísticos",
                "responses": {
                    "200": {"description": "Lista de lugares turísticos"}
                }
            },
            "post": {
                "summary": "Crear nuevo lugar turístico",
                "security": [{"BearerAuth": []}],
                "responses": {
                    "201": {"description": "Lugar creado"},
                    "401": {"description": "No autorizado"},
                    "403": {"description": "Requiere rol admin u operador"}
                }
            }
        },
        "/api/places/{id}": {
            "get": {
                "summary": "Obtener detalle de un lugar por ID",
                "parameters": [
                    {"name": "id", "in": "path", "required": True, "schema": {"type": "string"}}
                ],
                "responses": {
                    "200": {"description": "Detalle del lugar"},
                    "404": {"description": "Lugar no encontrado"}
                }
            }
        },
        "/api/routes/nodes": {
            "get": {
                "summary": "Listar POIs y nodos disponibles en el grafo Dijkstra",
                "responses": {
                    "200": {"description": "Diccionario de nodos"}
                }
            }
        },
        "/api/routes/dijkstra": {
            "post": {
                "summary": "Calcular la ruta óptima entre dos POIs usando el algoritmo Dijkstra",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/DijkstraQuery"}
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Ruta calculada con distancia, tiempo y tramos"},
                    "404": {"description": "Ruta inalcanzable o nodo desconocido"}
                }
            }
        },
        "/api/payments/quote": {
            "post": {
                "summary": "Cotizar tarifa calculada en servidor con descuentos y cupones",
                "responses": {
                    "200": {"description": "Cotización oficial calculada por PaymentService"}
                }
            }
        },
        "/api/payments/checkout": {
            "post": {
                "summary": "Procesar pago/reserva con verificación de idempotencia",
                "parameters": [
                    {
                        "name": "Idempotency-Key",
                        "in": "header",
                        "required": False,
                        "schema": {"type": "string"},
                        "description": "Clave única para evitar cobros duplicados"
                    }
                ],
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/CheckoutInput"}
                        }
                    }
                },
                "responses": {
                    "201": {"description": "Reserva confirmada con éxito"},
                    "422": {"description": "Datos de reserva inválidos"}
                }
            }
        }
    }
}

SWAGGER_UI_HTML = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Riqsi Rutas API — OpenAPI Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/gato-explorador.png" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar { display: none; }
    .swagger-ui .info .title { color: #880e4f; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
"""

@docs_bp.route("/api/openapi.json", methods=["GET"])
def get_openapi_spec():
    """Retorna la especificación OpenAPI 3.0 en JSON."""
    return jsonify(OPENAPI_SPEC)

@docs_bp.route("/docs", methods=["GET"])
def get_swagger_ui():
    """Renderiza la interfaz interactiva Swagger UI."""
    return render_template_string(SWAGGER_UI_HTML)

