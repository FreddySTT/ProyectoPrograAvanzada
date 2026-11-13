"""
Tests para Rate Limiter (en memoria / Redis).
"""
import time

def test_rate_limiter_exceeded(client):
    """Verifica que exceder el límite de peticiones devuelve 429 Too Many Requests."""
    # Hacer peticiones rápidas a /api/users (POST) hasta exceder el límite de 20
    # O testear directamente una función decorada con límite bajo
    from core.limiter import rate_limit
    from flask import jsonify

    # Probar el endpoint /api/users POST con payload inválido muchas veces
    statuses = []
    for _ in range(25):
        res = client.post("/api/users", json={})
        statuses.append(res.status_code)

    # Las primeras 20 deben ser 422 (ValidationError), y a partir de la 21 debe ser 429
    assert 429 in statuses
