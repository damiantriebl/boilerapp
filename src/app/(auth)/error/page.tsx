import { ErrorCard } from "@/components/auth/error-card";
import { Metadata } from "next";
import { AuthError } from "next-auth";

export const metadata: Metadata = {
  title: "Oops! Something went wrong",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams?:  Promise<{ message: AuthError["type"] }>;
}) {
  const params = await searchParams;
  return <ErrorCard message={params?.message} />;
}
