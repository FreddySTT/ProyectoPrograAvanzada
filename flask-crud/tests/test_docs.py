"""
Tests para OpenAPI Spec y Swagger UI (/api/openapi.json y /docs).
"""

def test_openapi_spec_json(client):
    """Verifica que /api/openapi.json devuelve una especificación OpenAPI 3.0 válida."""
    response = client.get("/api/openapi.json")
    assert response.status_code == 200
    data = response.get_json()
    assert data["openapi"].startswith("3.0")
    assert "info" in data
    assert data["info"]["title"] == "Riqsi Rutas API — Cochabamba Tourism Platform"
    assert "/api/places" in data["paths"]
    assert "/api/routes/dijkstra" in data["paths"]
    assert "/api/payments/checkout" in data["paths"]

def test_swagger_ui_html(client):
    """Verifica que /docs devuelve la página Swagger UI con status 200."""
    response = client.get("/docs")
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "swagger-ui" in html
    assert "SwaggerUIBundle" in html
