import { newVerification } from "@/actions/verify-token";
import { NewVerificationForm } from "@/components/form/verify-token-form";
import { PageProps } from "@/types";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default async function NewVerificationPage({ searchParams }: PageProps) {
  const sp = await searchParams
  if (!sp?.token) redirect("/login")

  const token = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const data = await newVerification(token)
  return <NewVerificationForm data={data} />
}