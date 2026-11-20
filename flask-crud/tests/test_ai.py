"""
Pruebas Unitarias para el endpoint de Recomendación Inteligente de Rutas (Firebase AI Logic).
"""

def test_recomendar_ruta_ia_gastronomia(client):
    resp = client.post(
        "/api/ai/recommend-route",
        json={"budget": 60.0, "hours": 3.0, "preference": "gastronomia"}
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert "data" in data
    itinerario = data["data"].get("itinerario") or []
    assert len(itinerario) >= 1
    assert "analisis_ia" in data["data"]


def test_recomendar_ruta_ia_default_params(client):
    resp = client.post("/api/ai/recommend-route", json={})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert "resumen" in data["data"]

