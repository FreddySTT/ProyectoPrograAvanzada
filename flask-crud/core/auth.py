"""
Módulo de Autenticación y Verificación de JWT con Decorador de Roles.

Capas de seguridad:
  1. Bearer token SIEMPRE requerido en dev + producción (ALLOW_DEV_ANON = False por defecto).
  2. Si SUPABASE_JWT_SECRET está configurado, la firma HS256 se verifica contra Supabase Auth.
     → Tokens inventados/auto-firmados son rechazados automáticamente.
  3. ALLOW_DEV_ANON = True SOLO en TestingConfig para pytest — nunca en producción real.
  4. X-Dev-Role header bypass ELIMINADO en entornos con SUPABASE_JWT_SECRET configurado.

Flujo para Postman (producción / dev):
  1. Iniciá sesión en el frontend con tu cuenta admin de Supabase Auth.
  2. Copiá el access_token del localStorage del browser (o de la respuesta de login).
  3. En Postman → Authorization → Bearer Token → pegá el token.
"""
import functools
import os
import hmac
from datetime import datetime, timezone
import jwt
from flask import request, current_app
from .errors import make_problem_response


def verify_admin_api_key(provided_key: str) -> bool:
    """Valida la clave API maestra mediante comparación de tiempo constante (previene timing attacks)."""
    expected_key = current_app.config.get("ADMIN_API_KEY") or os.environ.get("ADMIN_API_KEY", "")
    if not expected_key or not provided_key:
        return False
    return hmac.compare_digest(provided_key.strip(), expected_key.strip())


def require_admin_access(f):
    """
    Decorador de máxima seguridad para operaciones administrativas (POST, PUT, DELETE).
    Permite el acceso si se cumple CUALQUIERA de estas dos condiciones verificadas:
      1. Se envía el encabezado 'X-Admin-Key' con la clave API secreta del administrador (Postman seguro).
      2. Se envía un Bearer JWT de Supabase/Firebase Auth con rol 'admin'.
    Cualquier petición sin una de estas dos pruebas criptográficas es rechazada con 401 o 403.
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        # 1. Comprobar clave maestra en X-Admin-Key (Canal Postman seguro del administrador)
        admin_key = request.headers.get("X-Admin-Key", "")
        if admin_key and verify_admin_api_key(admin_key):
            request.user = {
                "id": "admin-api-key",
                "email": "admin-freddy@riqsirutas.bo",
                "role": "admin",
                "auth_method": "api_key",
            }
            return f(*args, **kwargs)

        # 2. Comprobar Bearer token JWT de Admin
        auth_header = request.headers.get("Authorization", "")
        supabase_secret_configured = bool(_get_supabase_jwt_secret())

        # Bypass exclusivo para suite de pruebas aisladas (TestingConfig)
        if not auth_header or not auth_header.startswith("Bearer "):
            is_pure_test_env = (
                current_app.config.get("ALLOW_DEV_ANON")
                and not supabase_secret_configured
            )
            if is_pure_test_env:
                request.user = {"id": "test-anon", "email": "test@riqsirutas.bo", "role": "admin", "auth_method": "test"}
                return f(*args, **kwargs)

            return make_problem_response(
                401,
                "Unauthorized",
                "Acceso restringido. Se requiere encabezado 'X-Admin-Key' legítimo o 'Authorization: Bearer <token>' con rol de administrador."
            )

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_jwt_token(token)
            role = extract_role_from_payload(payload)
            request.user = {
                "id": payload.get("sub") or payload.get("user_id"),
                "email": payload.get("email"),
                "role": role,
                "payload": payload,
                "auth_method": "jwt",
            }
        except ValueError as err:
            return make_problem_response(401, "Unauthorized", str(err))

        if role != "admin":
            return make_problem_response(
                403,
                "Forbidden",
                f"Acceso denegado. Se requiere rol de administrador para modificar destinos. Tu rol actual es '{role}'."
            )

        return f(*args, **kwargs)
    return decorated


def _get_supabase_jwt_secret() -> str:
    """Obtiene el JWT secret de Supabase desde config o variable de entorno."""
    return (
        current_app.config.get("SUPABASE_JWT_SECRET")
        or os.environ.get("SUPABASE_JWT_SECRET", "")
    ).strip()


def decode_jwt_token(token: str) -> dict:
    """
    Decodifica y valida el JWT Bearer token.

    - Si SUPABASE_JWT_SECRET está configurado: verifica firma HS256 contra Supabase Auth.
      Tokens auto-firmados o sin firma válida son rechazados con 401.
    - Si NO está configurado (solo TestingConfig): acepta cualquier token bien formado
      (verify_signature=False) para que pytest funcione sin Supabase real.
    """
    secret = _get_supabase_jwt_secret()
    try:
        if secret:
            # Modo producción/dev: firma verificada contra Supabase JWT secret real.
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        else:
            # Modo testing solamente: sin verificación de firma.
            payload = jwt.decode(token, options={"verify_signature": False})

        # Verificar expiración explícitamente (doble seguro)
        exp = payload.get("exp")
        if exp is not None:
            now_ts = datetime.now(timezone.utc).timestamp()
            if now_ts > exp:
                raise ValueError("El token de sesión ha expirado. Volvé a iniciar sesión.")

        return payload

    except jwt.ExpiredSignatureError:
        raise ValueError("El token de sesión ha expirado. Volvé a iniciar sesión.")
    except jwt.InvalidSignatureError:
        raise ValueError("Firma del token inválida. El token no fue emitido por Supabase Auth.")
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Token inválido: {str(e)}")


def extract_role_from_payload(payload: dict) -> str:
    """
    Extrae el rol del usuario desde el JWT de Supabase.
    Revisa en orden: user_metadata.role → app_metadata.role → role directo.
    """
    user_metadata = payload.get("user_metadata", {})
    if isinstance(user_metadata, dict) and user_metadata.get("role"):
        return str(user_metadata["role"]).lower()

    app_metadata = payload.get("app_metadata", {})
    if isinstance(app_metadata, dict) and app_metadata.get("role"):
        return str(app_metadata["role"]).lower()

    role = payload.get("role")
    if role and role not in ("authenticated", "anon"):
        return str(role).lower()

    return "normal"


def require_auth(f):
    """Decorador que exige un Bearer token JWT válido en todos los entornos."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header or not auth_header.startswith("Bearer "):
            # Solo permitir acceso anónimo en testing puro (pytest), nunca en prod/dev
            if current_app.config.get("ALLOW_DEV_ANON") and not _get_supabase_jwt_secret():
                request.user = {"id": "test-anon", "email": "test@riqsirutas.bo", "role": "admin"}
                return f(*args, **kwargs)
            return make_problem_response(
                401, "Unauthorized",
                "Se requiere Authorization: Bearer <token> de Supabase Auth."
            )

        token = auth_header.split(" ", 1)[1].strip()
        try:
            payload = decode_jwt_token(token)
            request.user = {
                "id": payload.get("sub") or payload.get("user_id"),
                "email": payload.get("email"),
                "role": extract_role_from_payload(payload),
                "payload": payload,
            }
        except ValueError as err:
            return make_problem_response(401, "Unauthorized", str(err))

        return f(*args, **kwargs)
    return decorated


def require_role(allowed_roles: list[str]):
    """
    Decorador que verifica que el usuario autenticado tenga uno de los roles permitidos.
    Exige token válido de Supabase Auth en todos los entornos excepto testing.

    Ejemplo de uso:
        @require_role(["admin"])
        def editar_lugar(place_id): ...
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            supabase_secret_configured = bool(_get_supabase_jwt_secret())

            # ── Bypass SOLO para pytest (TestingConfig: ALLOW_DEV_ANON=True, sin JWT secret) ──
            if not auth_header or not auth_header.startswith("Bearer "):
                is_pure_test_env = (
                    current_app.config.get("ALLOW_DEV_ANON")
                    and not supabase_secret_configured
                )
                if is_pure_test_env:
                    request.user = {"id": "test-anon", "email": "test@riqsirutas.bo", "role": "admin"}
                    if "admin" in [r.lower() for r in allowed_roles]:
                        return f(*args, **kwargs)
                    return make_problem_response(403, "Forbidden", "Rol 'admin' requerido.")

                return make_problem_response(
                    401, "Unauthorized",
                    "Se requiere Authorization: Bearer <token> de Supabase Auth para esta operación."
                )

            # ── Verificar y decodificar el JWT ──────────────────────────────────────────────
            token = auth_header.split(" ", 1)[1].strip()
            try:
                payload = decode_jwt_token(token)
                role = extract_role_from_payload(payload)
                request.user = {
                    "id": payload.get("sub") or payload.get("user_id"),
                    "email": payload.get("email"),
                    "role": role,
                    "payload": payload,
                }
            except ValueError as err:
                return make_problem_response(401, "Unauthorized", str(err))

            # ── Verificar que el rol esté en la lista permitida ─────────────────────────────
            allowed_lower = [r.lower() for r in allowed_roles]
            if role not in allowed_lower:
                return make_problem_response(
                    403,
                    "Forbidden",
                    f"Acceso denegado. Rol actual: '{role}'. "
                    f"Roles requeridos: {allowed_roles}. "
                    "Contactá al administrador del sistema."
                )

            return f(*args, **kwargs)
        return decorated
    return decorator
