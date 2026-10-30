"""
Flask Backend API — Riqsi Rutas & Programación Avanzada
Arquitectura: Supabase <---> Backend Flask (POO) <---> Frontend React SPA

Patrones y Conceptos POO aplicados:
1. Clase Usuario (Modelo de Dominio / Entidad)
2. Clase GestorUsuarios (Patrón Repositorio / Servicio en memoria)
3. Clase SupabaseBridge (Patrón Adaptador / Gateway hacia Supabase Cloud DB)
4. Clase GrafoRutasDijkstra (Algoritmo Dijkstra sobre Grafo Ponderado de Cochabamba)
5. Clase GestorPagos (Servicio de Pasarela de Pagos QR / Tarjetas con Vouchers)
"""

import os
import uuid
import heapq
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

# Carga de variables de entorno si existe .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ==============================================================================
# CONFIGURACIÓN SUPABASE & AMBIENTE
# ==============================================================================
SUPABASE_URL = os.environ.get("SUPABASE_URL", os.environ.get("VITE_SUPABASE_URL", "")).rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", os.environ.get("VITE_SUPABASE_ANON_KEY", ""))
PORT = int(os.environ.get("PORT", 5000))


# ==============================================================================
# MODELO ORIENTADO A OBJETOS: Clase Usuario
# ==============================================================================
class Usuario:
    """Representa la entidad Usuario con sus atributos y comportamientos."""

    def __init__(self, nombre: str, email: str, telefono: str, user_id: str = None, creado_en: str = None):
        self.id = user_id or str(uuid.uuid4())
        self.nombre = nombre.strip()
        self.email = email.strip().lower()
        self.telefono = telefono.strip()
        self.creado_en = creado_en or (datetime.utcnow().isoformat() + "Z")

    def to_dict(self) -> dict:
        """Serializa el objeto Usuario a diccionario para respuestas JSON."""
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "creado_en": self.creado_en,
        }

    def actualizar(self, nombre: str = None, email: str = None, telefono: str = None):
        """Método para modificar los atributos del objeto de forma controlada."""
        if nombre is not None:
            self.nombre = nombre.strip()
        if email is not None:
            self.email = email.strip().lower()
        if telefono is not None:
            self.telefono = telefono.strip()

    @staticmethod
    def validar_datos(data: dict):
        """Método estático para validar que los atributos requeridos estén presentes."""
        for campo in ("nombre", "email", "telefono"):
            valor = data.get(campo, "")
            if not isinstance(valor, str) or not valor.strip():
                return f"El campo '{campo}' es obligatorio."
        return None

    def __repr__(self):
        return f"<Usuario {self.nombre} ({self.email})>"


# ==============================================================================
# GESTOR / REPOSITORIO: Clase GestorUsuarios
# ==============================================================================
class GestorUsuarios:
    """Administra la colección de objetos Usuario en memoria (Encapsulamiento)."""

    def __init__(self):
        self._usuarios: dict[str, Usuario] = {}
        self._precargar_datos()

    def _precargar_datos(self):
        demo = [
            Usuario("Freddy Tejerina", "admin@riqsirutas.bo", "+591 700 00001"),
            Usuario("Camila Lara", "camila@unifranz.edu.bo", "+591 700 00002"),
            Usuario("Sergio Fuentes", "sergio@unifranz.edu.bo", "+591 700 00003"),
        ]
        for u in demo:
            self._usuarios[u.id] = u

    def cantidad(self) -> int:
        return len(self._usuarios)

    def listar_todos(self) -> list:
        ordenados = sorted(self._usuarios.values(), key=lambda u: u.creado_en)
        return [u.to_dict() for u in ordenados]

    def obtener_por_id(self, user_id: str) -> Usuario:
        return self._usuarios.get(user_id)

    def existe_email(self, email: str, ignorar_id: str = None) -> bool:
        email_limpio = email.strip().lower()
        for uid, usuario in self._usuarios.items():
            if usuario.email == email_limpio and uid != ignorar_id:
                return True
        return False

    def agregar(self, usuario: Usuario) -> Usuario:
        self._usuarios[usuario.id] = usuario
        return usuario

    def eliminar(self, user_id: str) -> Usuario:
        return self._usuarios.pop(user_id, None)


# ==============================================================================
# GATEWAY / ADAPTADOR: Clase SupabaseBridge
# ==============================================================================
class SupabaseBridge:
    """Encapsula la comunicación con Supabase Cloud DB vía REST API."""

    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.is_configured = bool(url and key and "supabase.co" in url)

    def _headers(self):
        return {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def fetch_places(self):
        if not self.is_configured:
            return None
        try:
            resp = requests.get(
                f"{self.url}/rest/v1/places?select=*&order=created_at.desc",
                headers=self._headers(),
                timeout=6,
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            print(f"[SupabaseBridge] Error fetching places: {e}")
        return None

    def create_place(self, data: dict):
        if not self.is_configured:
            return None
        try:
            resp = requests.post(
                f"{self.url}/rest/v1/places",
                headers=self._headers(),
                json=data,
                timeout=6,
            )
            if resp.status_code in (200, 201):
                res = resp.json()
                return res[0] if isinstance(res, list) and res else res
        except Exception as e:
            print(f"[SupabaseBridge] Error creating place: {e}")
        return None

    def save_booking(self, booking_data: dict):
        if not self.is_configured:
            return None
        try:
            resp = requests.post(
                f"{self.url}/rest/v1/bookings",
                headers=self._headers(),
                json=booking_data,
                timeout=6,
            )
            if resp.status_code in (200, 201):
                return resp.json()
        except Exception as e:
            print(f"[SupabaseBridge] Error saving booking: {e}")
        return None


# ==============================================================================
# ALGORITMO DIJKSTRA: Grafo Ponderado de Rutas Turísticas en Cochabamba
# ==============================================================================
class GrafoRutasDijkstra:
    """Implementa el algoritmo de Dijkstra para calcular la ruta óptima entre POIs."""

    def __init__(self):
        # Nodos turísticos de Cochabamba con coordenadas aproximadas
        self.nodos = {
            "cristo": {"nombre": "Cristo de la Concordia", "area": "Cerro San Pedro", "tipo": "Cultura"},
            "plaza_principal": {"nombre": "Plaza 14 de Septiembre", "area": "Casco Viejo", "tipo": "Centro Histórico"},
            "palacio_portales": {"nombre": "Palacio Portales (Patiño)", "area": "Queru Queru", "tipo": "Patrimonio"},
            "la_coronilla": {"nombre": "Colina de San Sebastián (La Coronilla)", "area": "Zona Sur", "tipo": "Histórico"},
            "laguna_alalay": {"nombre": "Circuito Laguna Alalay", "area": "Sureste", "tipo": "Naturaleza"},
            "parque_tunari": {"nombre": "Parque Nacional Tunari", "area": "Norte Cordillera", "tipo": "Aventura"},
            "parque_familia": {"nombre": "Parque de la Familia (Aguas Danzantes)", "area": "Zona Central", "tipo": "Recreación"},
            "el_prado": {"nombre": "Paseo El Prado & Gastronomía", "area": "Centro", "tipo": "Gastronomía"},
        }

        # Aristas ponderadas: origen -> destino (distancia_km, tiempo_minutos)
        self.aristas = {
            "cristo": [("plaza_principal", 4.5, 15), ("el_prado", 4.0, 12), ("laguna_alalay", 6.2, 20)],
            "plaza_principal": [("cristo", 4.5, 15), ("el_prado", 1.2, 5), ("la_coronilla", 1.8, 8), ("parque_familia", 1.5, 6)],
            "palacio_portales": [("el_prado", 2.2, 8), ("parque_tunari", 9.5, 25), ("plaza_principal", 3.0, 12)],
            "la_coronilla": [("plaza_principal", 1.8, 8), ("laguna_alalay", 4.0, 14)],
            "laguna_alalay": [("la_coronilla", 4.0, 14), ("cristo", 6.2, 20), ("plaza_principal", 4.8, 16)],
            "parque_tunari": [("palacio_portales", 9.5, 25), ("el_prado", 11.0, 30)],
            "parque_familia": [("plaza_principal", 1.5, 6), ("el_prado", 1.0, 4)],
            "el_prado": [("plaza_principal", 1.2, 5), ("cristo", 4.0, 12), ("palacio_portales", 2.2, 8), ("parque_familia", 1.0, 4)],
        }

    def calcular_ruta_optima(self, origen_id: str, destino_id: str, optimizar_por: str = "distancia"):
        """Calcula el trayecto más corto/rápido usando cola de prioridad min-heap."""
        if origen_id not in self.nodos or destino_id not in self.nodos:
            return None

        # heap queue: (costo_acumulado, nodo_actual, ruta_recorrida)
        cola = [(0, origen_id, [origen_id])]
        visitados = set()

        while cola:
            costo, actual, ruta = heapq.heappop(cola)

            if actual == destino_id:
                # Calcular desglose paso a paso
                pasos = []
                total_km = 0
                total_min = 0

                for i in range(len(ruta) - 1):
                    u, v = ruta[i], ruta[i + 1]
                    for vecino, dist, tiempo in self.aristas.get(u, []):
                        if vecino == v:
                            pasos.append({
                                "desde": self.nodos[u]["nombre"],
                                "hacia": self.nodos[v]["nombre"],
                                "distancia_km": dist,
                                "tiempo_min": tiempo,
                            })
                            total_km += dist
                            total_min += tiempo
                            break

                return {
                    "ok": True,
                    "origen": self.nodos[origen_id],
                    "destino": self.nodos[destino_id],
                    "ruta_nodos": [self.nodos[nid]["nombre"] for nid in ruta],
                    "ruta_ids": ruta,
                    "distancia_total_km": round(total_km, 2),
                    "tiempo_estimado_min": total_min,
                    "pasos": pasos,
                    "algoritmo": "Dijkstra (Tiempo Real)",
                }

            if actual in visitados:
                continue
            visitados.add(actual)

            for vecino, dist, tiempo in self.aristas.get(actual, []):
                if vecino not in visitados:
                    peso = dist if optimizar_por == "distancia" else tiempo
                    heapq.heappush(cola, (costo + peso, vecino, ruta + [vecino]))

        return None


# ==============================================================================
# GESTOR DE PAGOS & RESERVAS: Clase GestorPagos
# ==============================================================================
class GestorPagos:
    """Gestiona pagos QR bolivianos y transacciones con validación de reservas."""

    def __init__(self, supabase_bridge: SupabaseBridge):
        self.supabase = supabase_bridge
        self.reservas_memoria = []

    def procesar_checkout(self, datos: dict):
        required = ["experiencia", "monto_bob", "metodo_pago", "cliente_nombre", "cliente_ci", "cliente_email"]
        for campo in required:
            if not datos.get(campo):
                return {"ok": False, "error": f"El campo '{campo}' es requerido."}, 400

        codigo_reserva = f"RQ-2026-{uuid.uuid4().hex[:6].upper()}"
        fecha_reserva = datetime.utcnow().isoformat() + "Z"

        reserva = {
            "codigo": codigo_reserva,
            "experiencia": datos["experiencia"],
            "monto_bob": float(datos["monto_bob"]),
            "monto_usd": round(float(datos["monto_bob"]) / 6.96, 2),
            "metodo_pago": datos["metodo_pago"],
            "cliente_nombre": datos["cliente_nombre"],
            "cliente_ci": datos["cliente_ci"],
            "cliente_email": datos["cliente_email"],
            "viajeros": int(datos.get("viajeros", 1)),
            "fecha_viaje": datos.get("fecha_viaje", "Por coordinar"),
            "estado": "CONFIRMADO",
            "creado_en": fecha_reserva,
            "qr_payload": f"RIQSI|{codigo_reserva}|{datos['monto_bob']}|BOB|{datos['cliente_ci']}",
        }

        # Guardar en memoria
        self.reservas_memoria.append(reserva)

        # Replicar a Supabase si está disponible
        self.supabase.save_booking(reserva)

        return {
            "ok": True,
            "mensaje": "¡Reserva y pago procesados con éxito!",
            "reserva": reserva,
        }, 201


# ==============================================================================
# INICIALIZACIÓN DE LA APLICACIÓN FLASK
# ==============================================================================
app = Flask(__name__)
CORS(app)

gestor = GestorUsuarios()
supabase_bridge = SupabaseBridge(SUPABASE_URL, SUPABASE_KEY)
grafo = GrafoRutasDijkstra()
gestor_pagos = GestorPagos(supabase_bridge)


# ==============================================================================
# ENDPOINTS REST
# ==============================================================================
@app.route("/")
def index():
    return jsonify({
        "servicio": "Riqsi Rutas — Flask Backend API (Supabase & POO)",
        "version": "3.0-enterprise",
        "status": "online",
        "supabase_conectado": supabase_bridge.is_configured,
        "modulos": {
            "poo_usuarios": "Clase Usuario + GestorUsuarios",
            "dijkstra": "Clase GrafoRutasDijkstra (Cálculo de trayectos óptimos)",
            "pagos_qr": "Clase GestorPagos (Pasarela de pagos y reservas)",
            "supabase_bridge": "Integración Supabase Cloud PostgreSQL",
        },
        "endpoints": [
            "GET  /health",
            "GET  /api/users",
            "POST /api/users",
            "GET  /api/places",
            "POST /api/places",
            "GET  /api/routes/nodes",
            "POST /api/routes/dijkstra",
            "POST /api/payments/checkout",
        ],
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "supabase_configured": supabase_bridge.is_configured,
        "usuarios_en_memoria": gestor.cantidad(),
        "reservas_procesadas": len(gestor_pagos.reservas_memoria),
    })


# --- CRUD USUARIOS (POO) ---
@app.route("/api/users", methods=["GET"])
def listar_usuarios():
    return jsonify({
        "ok": True,
        "total": gestor.cantidad(),
        "data": gestor.listar_todos(),
    })


@app.route("/api/users/<user_id>", methods=["GET"])
def obtener_usuario(user_id):
    usuario = gestor.obtener_por_id(user_id)
    if not usuario:
        return jsonify({"ok": False, "error": "Usuario no encontrado"}), 404
    return jsonify({"ok": True, "data": usuario.to_dict()})


@app.route("/api/users", methods=["POST"])
def crear_usuario():
    data = request.get_json(silent=True) or {}
    error = Usuario.validar_datos(data)
    if error:
        return jsonify({"ok": False, "error": error}), 400

    if gestor.existe_email(data["email"]):
        return jsonify({"ok": False, "error": "Ya existe un usuario con ese email"}), 409

    nuevo = Usuario(
        nombre=data["nombre"],
        email=data["email"],
        telefono=data["telefono"],
    )
    gestor.agregar(nuevo)
    return jsonify({
        "ok": True,
        "mensaje": "Usuario creado exitosamente (Instancia POO)",
        "data": nuevo.to_dict(),
    }), 201


@app.route("/api/users/<user_id>", methods=["PUT"])
def actualizar_usuario(user_id):
    usuario = gestor.obtener_por_id(user_id)
    if not usuario:
        return jsonify({"ok": False, "error": "Usuario no encontrado"}), 404

    data = request.get_json(silent=True) or {}
    error = Usuario.validar_datos(data)
    if error:
        return jsonify({"ok": False, "error": error}), 400

    if gestor.existe_email(data["email"], ignorar_id=user_id):
        return jsonify({"ok": False, "error": "Ese email ya está en uso"}), 409

    usuario.actualizar(
        nombre=data["nombre"],
        email=data["email"],
        telefono=data["telefono"],
    )
    return jsonify({
        "ok": True,
        "mensaje": "Usuario actualizado exitosamente",
        "data": usuario.to_dict(),
    })


@app.route("/api/users/<user_id>", methods=["DELETE"])
def eliminar_usuario(user_id):
    eliminado = gestor.eliminar(user_id)
    if not eliminado:
        return jsonify({"ok": False, "error": "Usuario no encontrado"}), 404
    return jsonify({"ok": True, "mensaje": f"Usuario '{eliminado.nombre}' eliminado"})


# --- DESTINOS & SUPABASE PROXY ---
@app.route("/api/places", methods=["GET"])
def obtener_destinos():
    lugares_supabase = supabase_bridge.fetch_places()
    if lugares_supabase is not None:
        return jsonify({"ok": True, "source": "supabase", "data": lugares_supabase})

    return jsonify({
        "ok": True,
        "source": "backend-default",
        "mensaje": "Consulta lista para Supabase o fallback local",
    })


@app.route("/api/places", methods=["POST"])
def crear_destino():
    data = request.get_json(silent=True) or {}
    creado = supabase_bridge.create_place(data)
    if creado:
        return jsonify({"ok": True, "data": creado}), 201
    return jsonify({"ok": True, "data": data, "nota": "Procesado en backend"}), 200


# --- ALGORITMO DIJKSTRA ---
@app.route("/api/routes/nodes", methods=["GET"])
def obtener_nodos_rutas():
    return jsonify({"ok": True, "nodos": grafo.nodos})


@app.route("/api/routes/dijkstra", methods=["POST"])
def calcular_ruta():
    data = request.get_json(silent=True) or {}
    origen = data.get("origen", "plaza_principal")
    destino = data.get("destino", "cristo")
    opt = data.get("optimizar_por", "distancia")

    resultado = grafo.calcular_ruta_optima(origen, destino, opt)
    if not resultado:
        return jsonify({"ok": False, "error": "No se pudo calcular ruta entre esos puntos"}), 400

    return jsonify(resultado)


# --- PASARELA DE PAGOS & RESERVAS ---
@app.route("/api/payments/checkout", methods=["POST"])
def checkout_pago():
    data = request.get_json(silent=True) or {}
    res, status_code = gestor_pagos.procesar_checkout(data)
    return jsonify(res), status_code


@app.route("/api/payments/reservas", methods=["GET"])
def listar_reservas():
    return jsonify({
        "ok": True,
        "total": len(gestor_pagos.reservas_memoria),
        "data": gestor_pagos.reservas_memoria,
    })


# ==============================================================================
# EJECUCIÓN LOCAL
# ==============================================================================
if __name__ == "__main__":
    print("=" * 65)
    print("  🧭 Riqsi Rutas — Flask Backend Enterprise (Supabase + POO)")
    print(f"  Servidor corriendo en: http://0.0.0.0:{PORT}")
    print(f"  Supabase Configurado: {supabase_bridge.is_configured}")
    print("=" * 65)
    app.run(host="0.0.0.0", port=PORT, debug=True)
