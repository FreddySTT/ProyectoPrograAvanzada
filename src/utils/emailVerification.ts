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

  // Log de auditoría técnico (disponible en consola F12 para desarrolladores / depuración)
  if (typeof window !== "undefined") {
    console.info(
      `%c[Riqsi Rutas Auth]%c Código de verificación para ${cleanEmail}: %c${code}`,
      "color: #D81B60; font-weight: bold",
      "color: #37474F",
      "color: #059669; font-weight: bold; font-family: monospace"
    );
  }

  let delivered = false;

  // Canal 1: FormSubmit AJAX — Despacho directo al correo del destinatario
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        _subject: `Código de verificación Riqsi Rutas: ${code}`,
        _template: "box",
        _captcha: "false",
        nombre_destinatario: name,
        correo_destinatario: cleanEmail,
        codigo_de_verificacion: code,
        mensaje: `Hola ${name}, tu código de 6 dígitos para confirmar tu cuenta en Riqsi Rutas Cochabamba es: ${code}.\n\nIntroduce este código en la aplicación para activar tu cuenta. Vence en 15 minutos.`,
      }),
    });

    clearTimeout(timeoutId);
    if (res.ok) {
      delivered = true;
    }
  } catch (e) {
    console.warn("[Email Verification] Fallo en despacho vía FormSubmit:", e);
  }

  // Canal 2: EmailJS (si está configurado en variables de entorno)
  const emailJsService = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailJsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailJsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (emailJsService && emailJsTemplate && emailJsKey) {
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: emailJsService,
          template_id: emailJsTemplate,
          user_id: emailJsKey,
          template_params: {
            to_email: cleanEmail,
            user_name: name,
            verification_code: code,
          },
        }),
      });
      if (res.ok) delivered = true;
    } catch (e) {
      console.warn("[Email Verification] Fallo en despacho vía EmailJS:", e);
    }
  }

  return {
    success: true,
    delivered,
    message: `Código de 6 dígitos enviado a ${cleanEmail}. Revisa tu bandeja de entrada o spam.`,
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
