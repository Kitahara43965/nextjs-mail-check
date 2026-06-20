import { getServerSessionUser } from "@/services/tool/get-server-session-user.service";
import { checkRedirectToVerify } from "@/services/auth/check-redirect-to-verify";
import { PageRouteKind } from "@/enums/page-route-kind.enum";
import Note from "@/components/Note";

type Props = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function DashboardPage(
  {searchParams}: Props
) {
  const params = await searchParams;
  const reason = params.reason ?? null;
  const user = await getServerSessionUser();
  let userName:string|null = null;
  let pageRouteKind:PageRouteKind = PageRouteKind.UNDEFINED;
  
  if(reason === "login"){
    pageRouteKind = PageRouteKind.DASHBOARD_AFTER_LOGIN;
  }else{//reason
    pageRouteKind = PageRouteKind.DASHBOARD;
  }//reason

  await checkRedirectToVerify(user, pageRouteKind);

  if(user && typeof user.name === "string"){
    userName = user.name;
  }else{
    userName = "no user";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">
          ダッシュボード
        </h1>

        <p className="mb-6 text-gray-700">
          ログイン中: {userName}
        </p>

        <Note/>
      </div>
    </div>
  );
}