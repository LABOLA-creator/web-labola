/*
 * CÓMO ADAPTAR ESTE SERVICIO A UN NUEVO FORMULARIO
 * -------------------------------------------------
 *
 * 1. VARIABLES DE ENTORNO (.env, Vercel etc..)
 *    Asegúrate de tener estas tres vars configuradas en el proyecto:
 *
 *      EMAIL_API_URL=https://...          URL del endpoint de la API de email
 *      EMAIL_API_KEY=...                  API key para el header X-API-Key
 *      EMAIL_FROM=remitente@dominio.com   Dirección From por defecto
 *
 * 2. LLAMAR sendEmail() DESDE TU ROUTE O SERVER ACTION
 *    Importa la función y pasa los parámetros específicos del formulario:
 *
 *      import { sendEmail } from "@/src/lib/externalEmail";
 *
 *      await sendEmail({
 *        subject: "Asunto del correo",
 *        template: "nombre_del_template",     // debe existir en la API externa
 *        to: "destinatario@dominio.com",      // o array: ["a@x.com", "b@x.com"]
 *        data: {                              // campos que usa el template
 *          campo1: valor1,
 *          campo2: valor2,
 *        },
 *        // from: "otro@dominio.com",         // opcional, sobreescribe EMAIL_FROM
 *      });
 *
 * 3. PARÁMETROS
 *    subject      → Asunto del correo (puede ser dinámico con datos del form)
 *    template     → Nombre exacto del template configurado en la API externa
 *    to           → Destinatario(s). Puede ser string o array de strings
 *    data         → Objeto clave-valor con los campos que renderiza el template.
 *                   Los campos disponibles dependen del template, no de este archivo.
 *    from         → (Opcional) Sobreescribe EMAIL_FROM para este envío concreto
 *    attachments  → (Opcional) Array de archivos adjuntos. El contenido se convierte
 *                   automáticamente a base64 antes de enviarlo a la API.
 *                   Ejemplo:
 *                     attachments: [
 *                       {
 *                         filename: "cv.pdf",
 *                         content: buffer,           // Buffer, Uint8Array o string base64
 *                         contentType: "application/pdf",
 *                       }
 *                     ]
 *                   En un route handler, obtén el Buffer así:
 *                     const file = formData.get("file") as File;
 *                     const content = Buffer.from(await file.arrayBuffer());
 *
 * 4. EJEMPLO REAL (formulario de contacto de este proyecto)
 *    Ver: app/api/contact/route.ts
 */

type Attachment = {
  filename: string;
  content: Buffer | Uint8Array | string; // Buffer/Uint8Array se convierten a base64 automáticamente
  contentType: string;
};

type SendEmailParams = {
  subject: string;
  template: string;
  to: string | string[];
  data: Record<string, string | boolean | number>;
  from?: string; // defaults to EMAIL_FROM env var
  attachments?: Attachment[];
};

export async function sendEmail({ subject, template, to, data, from, attachments }: SendEmailParams) {
  const apiUrl = process.env.EMAIL_API_URL;
  const apiKey = process.env.EMAIL_API_KEY;
  const smtpFrom = from ?? process.env.EMAIL_FROM;

  if (!apiUrl || !apiKey) throw new Error("EMAIL_API_URL o EMAIL_API_KEY no configurados");
  if (!smtpFrom) throw new Error("EMAIL_FROM no configurado");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        smtp_from_email: smtpFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        template,
        data,
        ...(attachments?.length
          ? {
              attachments: attachments.map(({ filename, content, contentType }) => ({
                filename,
                contentType,
                content:
                  typeof content === "string"
                    ? content
                    : Buffer.from(content).toString("base64"),
              })),
            }
          : {}),
      }),
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("EMAIL_API_TIMEOUT");
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de la API de email: ${response.status} - ${errorBody}`);
  }

  return response.json();
}
