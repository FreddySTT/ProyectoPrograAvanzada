"""
Pruebas Unitarias para Endpoints de Atractivos y Validación de Esquemas.
"""
import jwt
from datetime import datetime, timedelta

def _admin_headers():
    token = jwt.encode(
        {
            "sub": "admin-places-test",
            "email": "admin@riqsirutas.bo",
            "user_metadata": {"role": "admin"},
            "exp": datetime.utcnow() + timedelta(hours=1),
        },
        "test-secret",
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}

def test_obtener_lugares(client):
    resp = client.get("/api/places")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert len(data["data"]) >= 1

def test_obtener_lugar_por_id(client):
    resp = client.get("/api/places/place-1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert data["data"]["title"] == "Cristo de la Concordia"

def test_actualizar_lugar_validacion(client):
    resp = client.put(
        "/api/places/place-1",
        json={
            "title": "Cristo de la Concordia Renovado",
            "area": "Cerro San Pedro",
            "precio": 90.0,
            "precio_usd": 12.93,
        },
        headers=_admin_headers(),
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["ok"] is True
    assert data["data"]["title"] == "Cristo de la Concordia Renovado"
    assert data["data"]["precio"] == 90.0

def test_lugar_no_encontrado(client):
    resp = client.get("/api/places/lugar-inexistente-xyz")
    assert resp.status_code == 404
    data = resp.get_json()
    assert data["title"] == "Not Found"

