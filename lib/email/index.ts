import { Resend } from "resend";
import { env, isEmailEnabled } from "@/lib/env";
import { APP_NAME } from "@/constants";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!isEmailEnabled()) {
    throw new Error("Email is not configured. Add RESEND_API_KEY to .env");
  }
  if (!resendInstance) {
    resendInstance = new Resend(env.RESEND_API_KEY);
  }
  return resendInstance;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!isEmailEnabled()) {
    console.log(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return;
  }
  await getResend().emails.send({
    from: env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await sendEmail(
    to,
    `Welcome to ${APP_NAME}`,
    `<h1>Welcome ${firstName}!</h1><p>Your account has been created successfully.</p>`
  );
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  await sendEmail(
    to,
    `Verify your email — ${APP_NAME}`,
    `<h1>Email verification</h1><p><a href="${url}">Click here to verify your account</a></p>`
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await sendEmail(
    to,
    `Password reset — ${APP_NAME}`,
    `<h1>Password reset</h1><p><a href="${url}">Click here to reset your password</a></p>`
  );
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  total: number
) {
  await sendEmail(
    to,
    `Order confirmed #${orderNumber} — ${APP_NAME}`,
    `<h1>Order confirmed</h1><p>Order number: <strong>${orderNumber}</strong></p><p>Total: <strong>$${total.toFixed(2)}</strong></p>`
  );
}

export async function sendShippingEmail(
  to: string,
  orderNumber: string,
  trackingInfo?: string
) {
  await sendEmail(
    to,
    `Order shipped #${orderNumber} — ${APP_NAME}`,
    `<h1>Your order has shipped</h1><p>Order number: <strong>${orderNumber}</strong></p>${trackingInfo ? `<p>Tracking: ${trackingInfo}</p>` : ""}`
  );
}
