"""
Tests para Paginación y Búsqueda de Texto Completo en /api/places.
"""

def test_paginacion_lugares(client):
    """Verifica que solicitar page y limit devuelva metadata de paginación."""
    res = client.get("/api/places?page=1&limit=2")
    assert res.status_code == 200
    data = res.get_json()
    assert data["ok"] is True
    assert data["paginated"] is True
    assert data["page"] == 1
    assert data["limit"] == 2
    assert "total" in data
    assert "total_pages" in data
    assert len(data["data"]) <= 2

def test_busqueda_texto_completo(client):
    """Verifica la búsqueda por palabra clave en título o área."""
    res = client.get("/api/places?q=Cristo")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert len(data) >= 1
    assert any("cristo" in p["title"].lower() for p in data)

def test_filtro_por_categoria(client):
    """Verifica el filtrado por categoría temática."""
    res = client.get("/api/places?category=naturaleza")
    assert res.status_code == 200
    data = res.get_json()["data"]
    for p in data:
        assert p.get("category") == "naturaleza"

