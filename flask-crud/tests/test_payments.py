"""
Pruebas Unitarias para Cálculo de Tarifas en Servidor e Idempotencia en Pagos.
"""

def test_calculo_tarifa_servidor(app):
    payment_service = app.extensions["payment_service"]

    # 2 pasajeros para place-1 (base 85 Bs) = 170 Bs
    # Con almuerzo (35 * 2 = 70 Bs) = 240 Bs
    # Con cupón COCHABAMBA2026 (20% desc = 48 Bs) = 192 Bs
    tarifa = payment_service.calcular_tarifa_servidor(
        lugar_id="place-1",
        pasajeros=2,
        incluir_guia=False,
        incluir_transporte=False,
        incluir_almuerzo=True,
        cupon="COCHABAMBA2026",
    )

    assert tarifa["subtotal_experiencias"] == 170.0
    assert tarifa["costo_almuerzo"] == 70.0
    assert tarifa["subtotal_bruto"] == 240.0
    assert tarifa["descuento_porcentaje"] == 20
    assert tarifa["monto_descuento"] == 48.0
    assert tarifa["total_bob"] == 192.0
    assert tarifa["total_usd"] == round(192.0 / 6.96, 2)

def test_checkout_idempotencia(client):
    payload = {
        "lugar_id": "place-1",
        "lugar_nombre": "Cristo de la Concordia",
        "cliente_nombre": "Carlos Montaño",
        "cliente_ci": "4433221-CBBA",
        "cliente_email": "carlos@test.bo",
        "metodo_pago": "qr",
        "pasajeros": 2,
    }
    idempotency_key = "idemp-test-uuid-9999"

    # Primer intento
    resp1 = client.post(
        "/api/payments/checkout",
        json=payload,
        headers={"Idempotency-Key": idempotency_key},
    )
    assert resp1.status_code == 201
    data1 = resp1.get_json()
    codigo1 = data1["reserva"]["codigo"]

    # Segundo intento con la misma clave de idempotencia
    resp2 = client.post(
        "/api/payments/checkout",
        json=payload,
        headers={"Idempotency-Key": idempotency_key},
    )
    assert resp2.status_code == 200
    data2 = resp2.get_json()
    assert data2["idempotente"] is True
    # Debe devolver exactamente el mismo código de reserva sin duplicar
    assert data2["reserva"]["codigo"] == codigo1

def test_checkout_validacion_pydantic_error(client):
    # Enviar payload sin cliente_nombre ni metodo_pago
    resp = client.post("/api/payments/checkout", json={"pasajeros": -5})
    assert resp.status_code == 422
    data = resp.get_json()
    assert data["title"] == "Unprocessable Entity"
    assert "invalid_params" in data
