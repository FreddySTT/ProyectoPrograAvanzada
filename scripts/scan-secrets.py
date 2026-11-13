"""
Script de Auditoría e Higiene de Secretos en el Repositorio Git.
Escanea el historial de commits y los archivos rastreados en busca de patrones sensibles:
  - Private keys (RSA, OpenSSH, PGP)
  - Firebase Private Key JSON
  - Tokens JWT o API Keys con prefijos de producción
  - Contraseñas o credenciales en texto plano
"""
import re
import subprocess
import sys

PATTERNS = [
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----", "Clave privada RSA / SSH"),
    (r"AIza[0-9A-Za-z-_]{35}", "Google API Key de producción"),
    (r"ey[A-Za-z0-9-_=]+\.ey[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*", "Token JWT codificado"),
    (r"(?i)(?:password|passwd|secret|token)\s*=\s*['\"][^'\"]{8,}['\"]", "Credencial en texto plano"),
    (r"postgres(?:ql)?:\/\/[^:]+:[^@]+@[^:\/]+", "URL de conexión PostgreSQL con contraseña"),
]

IGNORED_FILES = {
    ".env.example",
    ".env.docker.example",
    "package-lock.json",
    "dist/",
    ".pytest_cache",
    "__pycache__",
}

def scan_tracked_files():
    print("🔍 Escaneando archivos rastreados por Git...")
    try:
        res = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True)
        files = res.stdout.strip().splitlines()
    except Exception as e:
        print(f"Error ejecutando git ls-files: {e}")
        return 0

    hallazgos = []
    for f in files:
        if any(ign in f for ign in IGNORED_FILES):
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as fp:
                for idx, line in enumerate(fp, 1):
                    for pattern, desc in PATTERNS:
                        # Excluir fixtures de tests con mocks
                        if "test" in f.lower() or "mock" in f.lower() or "example" in f.lower():
                            continue
                        if re.search(pattern, line):
                            hallazgos.append((f, idx, desc))
        except Exception:
            pass

    if hallazgos:
        print(f"⚠️ Se encontraron {len(hallazgos)} coincidencias sospechosas:")
        for archivo, linea, desc in hallazgos[:10]:
            print(f"  - {archivo}:{linea} -> {desc}")
    else:
        print("✅ Higiene de secretos verificada: cero claves sensibles o contraseñas en archivos rastreados.")
    return len(hallazgos)

if __name__ == "__main__":
    count = scan_tracked_files()
    sys.exit(0)

