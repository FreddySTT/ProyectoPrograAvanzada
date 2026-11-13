"""
Tests para Concurrencia Optimista (OCC) en /api/places/<id>.
"""
import jwt
from datetime import datetime, timedelta, timezone

def _gen_admin_token():
    payload = {
        "sub": "admin-1",
        "email": "admin@riqsi.bo",
        "role": "admin",
        "exp": (datetime.now(timezone.utc) + timedelta(hours=1)).timestamp(),
    }
    return jwt.encode(payload, "secret-key-test", algorithm="HS256")

def test_concurrencia_optimista_version_mismatch(client):
    """Verifica que enviar una versión obsoleta devuelva 409 Conflict."""
    token = _gen_admin_token()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Obtener lugar inicial
    res = client.get("/api/places/place-1")
    assert res.status_code == 200
    data = res.get_json()["data"]

    # 2. Primera actualización legítima (avanza la versión a 2)
    update_1 = {
        "title": "Cristo de la Concordia Editado",
        "area": "San Pedro",
        "version": 1
    }
    res_up1 = client.put("/api/places/place-1", json=update_1, headers=headers)
    assert res_up1.status_code == 200
    assert res_up1.get_json()["version"] >= 2

    # 3. Segunda actualización concurrente con versión desactualizada (version=1 cuando en DB ya es 2+)
    update_conflict = {
        "title": "Intento de pisar datos viejos",
        "area": "San Pedro",
        "version": 1  # versión desactualizada
    }
    res_conflict = client.put("/api/places/place-1", json=update_conflict, headers=headers)
    assert res_conflict.status_code == 409
    prob = res_conflict.get_json()
    assert prob["title"] == "Conflict"
    assert "concurrencia optimista" in prob["detail"].lower()
