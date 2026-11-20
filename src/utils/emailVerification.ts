/**
 * Servicio de Verificación y Confirmación de Correo Electrónico
 * Riqsi Rutas - Cochabamba Turismo
 */

export interface VerificationData {
  email: string;
  name: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

// Almacenamiento en memoria para códigos de verificación
const pendingVerifications = new Map<string, VerificationData>();

/**
 * Genera un código de verificación criptográfico de 6 dígitos numéricos
 */
export function generateVerificationCode(): string {
  // Genera un número aleatorio entre 100000 y 999999
  const array = new Uint32Array(1);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
    const code = 100000 + (array[0] % 900000);
    return code.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envía el código de confirmación al correo del usuario y registra el código pendiente
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
): Promise<{ success: boolean; delivered: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();

  // Guardar en memoria con tiempo de expiración de 15 minutos
  const expiresAt = Date.now() + 15 * 60 * 1000;
  pendingVerifications.set(cleanEmail, {
    email: cleanEmail,
    name,
    code,
    expiresAt,
    attempts: 0,
  });

  let delivered = false;

  // Intento de envío real mediante Web3Forms / endpoint público de correo
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        access_key: "c23f2f53-29a8-42fa-9082-95f2e604f861",
        subject: `Código de confirmación Riqsi Rutas: ${code}`,
        from_name: "Riqsi Rutas Cochabamba",
        to: cleanEmail,
        email: cleanEmail,
        message: `¡Hola ${name}!\n\nTu código de verificación para activar tu cuenta de viajero en Riqsi Rutas Cochabamba es:\n\n👉  ${code}  👈\n\nIngresa este código de 6 dígitos en la aplicación para confirmar tu dirección de correo electrónico.\n\nEste código vence en 15 minutos.\n\n¡Gracias por explorar Cochabamba con nosotros!\nEquipo Riqsi Rutas · Turismo Cochabamba`,
      }),
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      delivered = true;
    }
  } catch (e) {
    // Si la red no permite el envío externo, se maneja de forma segura sin romper la experiencia
    console.info("Intento de envío de email en segundo plano:", e);
  }

  return {
    success: true,
    delivered,
    message: delivered
      ? `Código enviado con éxito a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`
      : `Código de verificación generado para ${cleanEmail}.`,
  };
}

/**
 * Valida si el código ingresado por el usuario es correcto y no ha expirado
 */
export function verifyCode(
  email: string,
  inputCode: string
): { valid: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const data = pendingVerifications.get(cleanEmail);

  if (!data) {
    return {
      valid: false,
      message: "No se encontró ningún código de verificación pendiente. Solicita uno nuevo.",
    };
  }

  if (Date.now() > data.expiresAt) {
    pendingVerifications.delete(cleanEmail);
    return {
      valid: false,
      message: "El código de verificación ha expirado (límite de 15 minutos). Por favor solicita uno nuevo.",
    };
  }

  data.attempts += 1;
  if (data.attempts > 5) {
    pendingVerifications.delete(cleanEmail);
    return {
      valid: false,
      message: "Demasiados intentos incorrectos. Por seguridad solicita un nuevo código.",
    };
  }

  if (data.code !== inputCode.trim()) {
    return {
      valid: false,
      message: `Código incorrecto. Te quedan ${5 - data.attempts} intento(s).`,
    };
  }

  // Código verificado exitosamente: limpiar registro pendiente
  pendingVerifications.delete(cleanEmail);
  return {
    valid: true,
    message: "¡Correo electrónico verificado exitosamente!",
  };
}

/**
 * Obtiene el código activo para previsualización inmediata en entorno de pruebas/demo
 */
export function getActiveVerificationCode(email: string): string | null {
  const cleanEmail = email.trim().toLowerCase();
  const data = pendingVerifications.get(cleanEmail);
  if (!data || Date.now() > data.expiresAt) return null;
  return data.code;
}
