import { getVerifyMessage } from "@/services/tool/get-verify-message.service";
import VerifyClient from "@/components/auth/VerifyClient";
import { getServerSessionUser } from "@/services/tool/get-server-session-user.service";

type Props = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export default async function VerifyPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const reason = params.reason ?? null;
  const verifyMessage = getVerifyMessage(reason);
  const user = await getServerSessionUser();
  let userName:string|null = null;
  let userEmail:string|null = null;

  if(user){
    userName = user.name;
    userEmail = user.email;
  }else{
    userName = "no user";
    userEmail = null;
  }

  return (
    <VerifyClient
      userName={userName}
      userEmail={userEmail}
      verifyMessage={verifyMessage}
      reason={reason}
    />
  );
}