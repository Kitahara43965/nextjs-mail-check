// app/register/page.tsx

import RegisterForm from "@/components/auth/RegisterForm";
import { getServerSessionUser } from "@/services/tool/get-server-session-user.service";
import { checkRedirectToVerify } 
  from "@/services/auth/server-component/check-redirect-to-verify";
import { PageRouteKind } from "@/enums/page-route-kind.enum";

export default async function RegisterPage() {
  const user = await getServerSessionUser();
  await checkRedirectToVerify(user,PageRouteKind.REGISTER);
  return <RegisterForm />;
}