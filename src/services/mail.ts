import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('resend', resend, process.env.RESEND_API_KEY)
export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;
    const res = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "[Next Dashboard] Action required: Verify your email",
      html: `<p>Click <a href="${link}">Here</a> to verify your email.</p>`,
    });
    console.log("Verification email sent:", res);
  } catch (err) {
    console.error("Verification email failed:", err);
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  try {
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`;
    const res = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "[Next Dashboard] Action required: Reset your password",
      html: `<p>Click <a href="${link}">Here</a> to reset your password.</p>`,
    });
    console.log("Reset password email sent:", res);
  } catch (err) {
    console.error("Reset password email failed:", err);
  }
};

export const sendTwoFactorEmail = async (email: string, token: string) => {
  try {
    const res = await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "[Next Dashboard] Action required: Confirm Two-Factor Authentication",
      html: `<p>${token} is your authentication Code.</p>`,
    });
    console.log("2FA email sent:", res);
  } catch (err) {
    console.error("2FA email failed:", err);
  }
};
