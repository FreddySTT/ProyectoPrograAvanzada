"""
Pruebas Unitarias para Autenticación JWT y Decorador de Roles.
"""
import jwt
from datetime import datetime, timedelta

def test_require_role_admin_permitido(client):
    # Generar token JWT con rol admin
    token = jwt.encode(
        {
            "sub": "user-admin-123",
            "email": "admin@riqsirutas.bo",
            "user_metadata": {"role": "admin"},
            "exp": datetime.utcnow() + timedelta(hours=1),
        },
        "test-secret",
        algorithm="HS256",
    )

    resp = client.delete(
        "/api/places/place-temp",
        headers={"Authorization": f"Bearer {token}"},
    )
    # Debe ser permitido (200)
    assert resp.status_code == 200
    assert resp.get_json()["ok"] is True

def test_require_role_usuario_normal_denegado(client):
    # Generar token JWT con rol normal
    token = jwt.encode(
        {
            "sub": "user-normal-456",
            "email": "viajero@riqsirutas.bo",
            "user_metadata": {"role": "normal"},
            "exp": datetime.utcnow() + timedelta(hours=1),
        },
        "test-secret",
        algorithm="HS256",
    )

    resp = client.delete(
        "/api/places/place-1",
        headers={"Authorization": f"Bearer {token}"},
    )
    # Debe retornar 403 Forbidden
    assert resp.status_code == 403
    data = resp.get_json()
    assert data["title"] == "Forbidden"
    assert "no tiene permiso" in data["detail"]

def test_token_expirado_unauthorized(client):
    # Generar token expirado en el pasado
    token = jwt.encode(
        {
            "sub": "user-expired",
            "exp": datetime.utcnow() - timedelta(minutes=10),
        },
        "test-secret",
        algorithm="HS256",
    )

    resp = client.delete(
        "/api/places/place-1",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 401
    data = resp.get_json()
    assert data["title"] == "Unauthorized"
    assert "ha expirado" in data["detail"]

