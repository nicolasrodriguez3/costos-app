import { Resend } from "resend";

import { env } from "@/config/env";

let _resend: Resend | null = null;
const getResend = () => {
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
};

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const result = await getResend().emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("Failed to send email:", result.error);
      throw new Error(result.error.message);
    }

    return result;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  return sendEmail({
    to,
    subject: "Verifica tu email",
    html: `
      <h1>Verifica tu email</h1>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px;">
        Verificar email
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${url}</p>
      <p>Este enlace expirará en 1 hora.</p>
    `,
  });
}

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  return sendEmail({
    to,
    subject: "Restablece tu contraseña",
    html: `
      <h1>Restablece tu contraseña</h1>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px;">
        Restablecer contraseña
      </a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${url}</p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
    `,
  });
}
