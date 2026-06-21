// app/login/page.tsx

import LoginForm from "@/components/auth/LoginForm";
import { getServerSessionUser } from "@/services/tool/get-server-session-user.service";
import { checkRedirectToVerify } 
  from "@/services/auth/server-component/check-redirect-to-verify";
import { PageRouteKind } from "@/enums/page-route-kind.enum";

export default async function LoginPage() {
  const user = await getServerSessionUser();
  await checkRedirectToVerify(user,PageRouteKind.LOGIN);
  return <LoginForm />;
}