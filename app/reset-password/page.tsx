// app/reset-password/page.tsx

import { redirect } from "next/navigation";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

type Props = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/request-password-reset");
  }

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/reset-password/verify?token=${token}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    redirect("/request-password-reset");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <PasswordResetForm token={token} />
    </div>
  );
}