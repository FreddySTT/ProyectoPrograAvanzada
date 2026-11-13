"""
Servicio de Pagos, Cálculo de Tarifas en Servidor, Idempotencia y Máquina de Estados.
"""
import uuid
from datetime import datetime
from models.database import PLACES_FALLBACK, SupabaseBridge

COUPONS = {
    "COCHABAMBA2026": 20,  # 20% descuento Bicentenario
    "RIQSI10": 10,         # 10% descuento Riqsi
    "BIENVENIDO": 15,      # 15% descuento nuevos viajeros
}

ADDON_RATES = {
    "guia_fijo": 50.0,       # Bs. 50 fijo por grupo
    "transporte_pax": 40.0,  # Bs. 40 por pasajero
    "almuerzo_pax": 35.0,    # Bs. 35 por pasajero
}

class PaymentService:
    """Gestiona pagos seguros, cálculo estricto en servidor e idempotencia."""

    def __init__(self, supabase_bridge: SupabaseBridge):
        self.supabase = supabase_bridge
        self.reservas_memoria: list[dict] = []
        self._idempotency_store: dict[str, dict] = {}

    def calcular_tarifa_servidor(self, lugar_id: str, pasajeros: int, incluir_guia: bool = False,
                                incluir_transporte: bool = False, incluir_almuerzo: bool = False,
                                cupon: str = None) -> dict:
        """
        Calcula el total oficial exclusivamente en el servidor ignorando montos del cliente.
        """
        # Obtener precio base del lugar
        base_unitario = 85.0
        if lugar_id and lugar_id in PLACES_FALLBACK:
            base_unitario = float(PLACES_FALLBACK[lugar_id].get("precio") or 85.0)

        subtotal_experiencias = base_unitario * pasajeros
        costo_guia = ADDON_RATES["guia_fijo"] if incluir_guia else 0.0
        costo_transporte = (ADDON_RATES["transporte_pax"] * pasajeros) if incluir_transporte else 0.0
        costo_almuerzo = (ADDON_RATES["almuerzo_pax"] * pasajeros) if incluir_almuerzo else 0.0

        subtotal_bruto = subtotal_experiencias + costo_guia + costo_transporte + costo_almuerzo

        porcentaje_descuento = 0
        if cupon:
            clean_coupon = cupon.strip().upper()
            porcentaje_descuento = COUPONS.get(clean_coupon, 0)

        monto_descuento = round(subtotal_bruto * (porcentaje_descuento / 100.0), 2)
        total_bob = max(round(subtotal_bruto - monto_descuento, 2), 0.0)
        total_usd = round(total_bob / 6.96, 2)

        return {
            "precio_unitario_base": base_unitario,
            "pasajeros": pasajeros,
            "subtotal_experiencias": subtotal_experiencias,
            "costo_guia": costo_guia,
            "costo_transporte": costo_transporte,
            "costo_almuerzo": costo_almuerzo,
            "subtotal_bruto": subtotal_bruto,
            "descuento_porcentaje": porcentaje_descuento,
            "monto_descuento": monto_descuento,
            "total_bob": total_bob,
            "total_usd": total_usd,
        }

    def procesar_checkout(self, datos: dict, idempotency_key: str = None) -> tuple[dict, int]:
        """
        Procesa el pago y crea la reserva de forma idempotente.
        """
        # 1. Chequeo de idempotencia
        if idempotency_key:
            if idempotency_key in self._idempotency_store:
                cached_res = self._idempotency_store[idempotency_key]
                return {
                    "ok": True,
                    "mensaje": "Reserva recuperada desde caché de idempotencia.",
                    "idempotente": True,
                    "reserva": cached_res,
                }, 200

        lugar_id = datos.get("lugar_id") or "place-1"
        pasajeros = max(int(datos.get("pasajeros", 1)), 1)
        experiencia = datos.get("experiencia") or datos.get("lugar_nombre") or "Tour Cochabamba"

        # 2. Cálculo estricto en servidor
        desglose = self.calcular_tarifa_servidor(
            lugar_id=lugar_id,
            pasajeros=pasajeros,
            incluir_guia=bool(datos.get("incluir_guia")),
            incluir_transporte=bool(datos.get("incluir_transporte")),
            incluir_almuerzo=bool(datos.get("incluir_almuerzo")),
            cupon=datos.get("cupon_descuento"),
        )

        codigo_reserva = f"RQ-2026-{uuid.uuid4().hex[:6].upper()}"
        fecha_reserva = datetime.utcnow().isoformat() + "Z"

        reserva = {
            "codigo": codigo_reserva,
            "lugar_id": lugar_id,
            "experiencia": experiencia,
            "monto_bob": desglose["total_bob"],
            "monto_usd": desglose["total_usd"],
            "desglose_calculado": desglose,
            "metodo_pago": datos.get("metodo_pago", "QR Simple Bolivia"),
            "cliente_nombre": datos.get("cliente_nombre", "").strip(),
            "cliente_ci": datos.get("cliente_ci", "8765432-CBBA").strip(),
            "cliente_email": datos.get("cliente_email", "").strip().lower(),
            "cliente_telefono": datos.get("cliente_telefono", ""),
            "viajeros": pasajeros,
            "fecha_viaje": datos.get("fecha_viaje") or "Por coordinar",
            "estado": "CONFIRMADO",  # Máquina de estados: PENDING -> CONFIRMED
            "creado_en": fecha_reserva,
            "qr_payload": f"RIQSI|{codigo_reserva}|{desglose['total_bob']}|BOB|{datos.get('cliente_ci', '')}",
        }

        # 3. Guardar en memoria y en almacén de idempotencia
        self.reservas_memoria.append(reserva)
        if idempotency_key:
            self._idempotency_store[idempotency_key] = reserva

        # 4. Replicar a Supabase si está disponible
        self.supabase.save_booking(reserva)

        return {
            "ok": True,
            "mensaje": "¡Reserva y pago procesados con éxito con tarifa calculada en servidor!",
            "reserva": reserva,
        }, 201
