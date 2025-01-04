import { NewPasswordForm } from "@/components/form/new-password-form";
import { getResetPasswordToken } from "@/services/reset-password-token";
import { PageProps } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default async function NewPassword({ searchParams }: PageProps) {
  const sp = await searchParams; // Desenvuelve la promesa

  if (!sp?.token) {
    redirect("/");
  }

  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const resetPasswordToken = await getResetPasswordToken(token);
  if (!resetPasswordToken) redirect("/");

  return <NewPasswordForm token={resetPasswordToken.token} />;
}