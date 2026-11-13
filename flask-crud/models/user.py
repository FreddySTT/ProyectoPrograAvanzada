"""
Modelo de Dominio POO: Usuario y Repositorio GestorUsuarios.
"""
import uuid
from datetime import datetime

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
        """Modifica los atributos del objeto de forma controlada."""
        if nombre is not None:
            self.nombre = nombre.strip()
        if email is not None:
            self.email = email.strip().lower()
        if telefono is not None:
            self.telefono = telefono.strip()

    @staticmethod
    def validar_datos(data: dict):
        """Valida que los atributos requeridos estén presentes."""
        for campo in ("nombre", "email", "telefono"):
            valor = data.get(campo, "")
            if not isinstance(valor, str) or not valor.strip():
                return f"El campo '{campo}' es obligatorio."
        return None

    def __repr__(self):
        return f"<Usuario {self.nombre} ({self.email})>"


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

    def listar_todos(self) -> list[dict]:
        return [u.to_dict() for u in self._usuarios.values()]

    def obtener_por_id(self, user_id: str) -> Usuario | None:
        return self._usuarios.get(user_id)

    def existe_email(self, email: str) -> bool:
        clean = email.strip().lower()
        return any(u.email == clean for u in self._usuarios.values())

    def agregar(self, usuario: Usuario):
        self._usuarios[usuario.id] = usuario

    def eliminar(self, user_id: str) -> bool:
        if user_id in self._usuarios:
            del self._usuarios[user_id]
            return True
        return False
