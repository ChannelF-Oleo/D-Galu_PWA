import { defineSecret } from "firebase-functions/params";
import { Resend } from "resend";

// Definimos el secreto a nivel global del módulo
export const resendApiKey = defineSecret("RESEND_API_KEY");

/**
 * Inicializa el cliente de Resend de forma segura dentro del scope de la función.
 * Debe llamarse DENTRO de la función ejecutada para acceder a .value()
 */
export const getResendClient = (): Resend => {
  const key = resendApiKey.value();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(key);
};
