"""
Rate Limiter para Flask — Soporte Redis + Fallback en memoria.
Protege endpoints sensibles (pagos, autenticación, creación de recursos).
"""
import os
import time
from functools import wraps
from flask import request, jsonify

# Cache en memoria como fallback si Redis no está disponible
_MEM_CACHE: dict[str, list[float]] = {}
_REDIS_CLIENT = None

def _get_redis():
    global _REDIS_CLIENT
    if _REDIS_CLIENT is not None:
        return _REDIS_CLIENT
    redis_url = os.environ.get("REDIS_URL")
    if redis_url:
        try:
            import redis
            _REDIS_CLIENT = redis.from_url(redis_url, decode_responses=True)
            _REDIS_CLIENT.ping()
            return _REDIS_CLIENT
        except Exception:
            _REDIS_CLIENT = False
    return None

def rate_limit(requests_per_minute: int = 60, key_func=None):
    """
    Decorador de límite de peticiones (Sliding Window).
    :param requests_per_minute: Peticiones permitidas en una ventana de 60 segundos.
    :param key_func: Función opcional para extraer la clave (por defecto: IP del cliente).
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Obtener identificador del cliente (IP o header X-Forwarded-For)
            if key_func:
                client_id = key_func()
            else:
                client_id = request.headers.get("X-Forwarded-For", request.remote_addr or "127.0.0.1").split(",")[0].strip()

            bucket_key = f"rate_limit:{fn.__name__}:{client_id}"
            now = time.time()
            window_seconds = 60

            r = _get_redis()
            if r:
                try:
                    pipe = r.pipeline()
                    pipe.zremrangebyscore(bucket_key, 0, now - window_seconds)
                    pipe.zadd(bucket_key, {str(now): now})
                    pipe.zcard(bucket_key)
                    pipe.expire(bucket_key, window_seconds)
                    _, _, req_count, _ = pipe.execute()

                    if req_count > requests_per_minute:
                        return jsonify({
                            "type": "https://httpstatuses.com/429",
                            "title": "Too Many Requests",
                            "status": 429,
                            "detail": f"Límite de {requests_per_minute} peticiones por minuto excedido. Reintenta más tarde."
                        }), 429
                    return fn(*args, **kwargs)
                except Exception:
                    pass  # Fallback a memoria si Redis falla momentáneamente

            # Implementación en memoria (Sliding Window)
            timestamps = _MEM_CACHE.get(bucket_key, [])
            cutoff = now - window_seconds
            timestamps = [ts for ts in timestamps if ts > cutoff]

            if len(timestamps) >= requests_per_minute:
                return jsonify({
                    "type": "https://httpstatuses.com/429",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": f"Límite de {requests_per_minute} peticiones por minuto excedido."
                }), 429

            timestamps.append(now)
            _MEM_CACHE[bucket_key] = timestamps
            return fn(*args, **kwargs)
        return wrapper
    return decorator

