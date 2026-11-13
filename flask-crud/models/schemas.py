"""
Esquemas de validación de datos con Pydantic v2.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, field_validator

class UserCreateSchema(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo del usuario")
    email: EmailStr = Field(..., description="Correo electrónico válido")
    telefono: str = Field(..., min_length=6, max_length=25, description="Teléfono de contacto")

class UserUpdateSchema(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, min_length=6, max_length=25)

class PlaceSchema(BaseModel):
    id: Optional[str] = None
    title: str = Field(..., min_length=2, max_length=150)
    area: str = Field(..., min_length=2, max_length=100)
    tag: Optional[str] = "Imperdible"
    category: Optional[str] = "cultura"
    image: Optional[str] = None
    rating: Optional[str] = "4.8"
    time: Optional[str] = "1-2 h"
    featured: Optional[bool] = False
    visible: Optional[bool] = True
    precio: Optional[float] = Field(None, ge=0)
    precio_usd: Optional[float] = Field(None, ge=0)
    precio_detalle: Optional[str] = None
    horario_visita: Optional[str] = None
    descripcion_items: Optional[List[str]] = None
    consejo: Optional[str] = None
    dato_historico: Optional[str] = None
    badges: Optional[List[str]] = None
    coordinates: Optional[List[float]] = None

    @field_validator("coordinates")
    @classmethod
    def validate_coords(cls, v):
        if v is not None and len(v) != 2:
            raise ValueError("Coordinates debe contener exactamente 2 valores: [lng, lat]")
        return v

class DijkstraQuerySchema(BaseModel):
    origen: str = Field(..., min_length=1, description="ID o clave del nodo origen")
    destino: str = Field(..., min_length=1, description="ID o clave del nodo destino")
    optimizar_por: Optional[str] = Field("distancia", pattern="^(distancia|tiempo)$")

class CheckoutSchema(BaseModel):
    experiencia: Optional[str] = None
    lugar_id: Optional[str] = None
    lugar_nombre: Optional[str] = None
    cliente_nombre: str = Field(..., min_length=2, max_length=100)
    cliente_ci: Optional[str] = Field("8765432-CBBA", min_length=4)
    cliente_email: EmailStr
    cliente_telefono: Optional[str] = None
    metodo_pago: str = Field(..., pattern="^(qr|card|cash|QR Simple Bolivia|Tarjeta Visa/Mastercard|Efectivo / Transferencia)$")
    pasajeros: Optional[int] = Field(1, ge=1, le=50)
    fecha_viaje: Optional[str] = None
    incluir_guia: Optional[bool] = False
    incluir_transporte: Optional[bool] = False
    incluir_almuerzo: Optional[bool] = False
    cupon_descuento: Optional[str] = None

