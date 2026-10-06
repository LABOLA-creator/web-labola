import { NextResponse } from "next/server";
import { sendEmail } from "@/src/lib/externalEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getTrimmed = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

type TurnstileSiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function POST(request: Request) {
  try {
    const shouldVerifyTurnstile = process.env.NODE_ENV === "production";
    const formData = await request.formData();
    const firstName = getTrimmed(formData, "firstName");
    const company = getTrimmed(formData, "company");
    const email = getTrimmed(formData, "email");
    const message = getTrimmed(formData, "message");
    const privacyAccepted = Boolean(formData.get("privacy"));
    const turnstileToken =
      getTrimmed(formData, "cf-turnstile-response") ||
      getTrimmed(formData, "turnstileToken");

    if (process.env.NODE_ENV !== "production") {
      console.log("[CONTACT_FORM] payload", {
        firstName,
        company,
        email,
        messageLength: message.length,
        privacyAccepted,
        hasTurnstileToken: Boolean(turnstileToken),
      });
    }

    if (!firstName || !company || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Email inválido." },
        { status: 400 }
      );
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { ok: false, error: "Debes aceptar la política de privacidad." },
        { status: 400 }
      );
    }

    if (shouldVerifyTurnstile) {
      if (!turnstileToken) {
        return NextResponse.json(
          { ok: false, error: "Completa la verificación captcha." },
          { status: 400 }
        );
      }

      const turnstileVerification = await verifyTurnstileToken(turnstileToken, request);

      if (!turnstileVerification.ok) {
        const status =
          turnstileVerification.reason === "missing-secret"
            ? 500
            : turnstileVerification.reason === "verification-request-failed"
              ? 502
              : 400;

        const devDetails =
          process.env.NODE_ENV !== "production" && turnstileVerification.errorCodes?.length
            ? ` (${turnstileVerification.errorCodes.join(", ")})`
            : "";

        return NextResponse.json(
          {
            ok: false,
            error:
              status === 500
                ? "Captcha no configurado en el servidor."
                : `No se pudo validar el captcha.${devDetails}`,
          },
          { status }
        );
      }
    }

    await sendEmail({
      subject: `Contacto web - ${firstName} de ${company}`,
      template: "labola_contact_form",
      to: process.env.EMAIL_TO ?? (() => { throw new Error("EMAIL_TO no configurado"); })(),
      data: { name: firstName, company, email, message, privacy: true },
    });

    return NextResponse.json({
      ok: true,
      message: "Mensaje enviado. Gracias por contactar.",
    });
  } catch (error) {
    console.error("[CONTACT_FORM_ERROR]", error);
    const devMessage =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? ` (${error.message})`
        : "";
    let serverIp: string | null = null;
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      const ipData = (await ipRes.json()) as { ip: string };
      serverIp = ipData.ip ?? null;
    } catch {
      // ignore
    }
    return NextResponse.json(
      {
        ok: false,
        error: `No se pudo enviar el mensaje. Inténtalo de nuevo.${devMessage}`,
        serverIp,
      },
      { status: 500 }
    );
  }
}

async function verifyTurnstileToken(token: string, request: Request): Promise<{
  ok: boolean;
  reason?: "missing-secret" | "verification-failed" | "verification-request-failed";
  errorCodes?: string[];
}> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim() ?? "";

  if (!secret) {
    return { ok: false, reason: "missing-secret" };
  }

  const clientIp = getClientIp(request);
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (clientIp) {
    body.set("remoteip", clientIp);
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, reason: "verification-request-failed" };
    }

    const result = (await response.json()) as TurnstileSiteverifyResponse;

    if (!result.success) {
      return {
        ok: false,
        reason: "verification-failed",
        errorCodes: result["error-codes"] ?? [],
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[TURNSTILE_VERIFY_ERROR]", error);
    return { ok: false, reason: "verification-request-failed" };
  }
}

function getClientIp(request: Request) {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "";

  return forwardedFor.split(",")[0]?.trim() ?? "";
}
