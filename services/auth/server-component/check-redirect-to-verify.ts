import type { User} from "@prisma/client";
import { redirect } from "next/navigation";
import {getCanResendVerificationEmailFromStringDate}
  from "@/services/tool/can-resend-verification-email.service";
import { PageRouteKind } from "@/enums/page-route-kind.enum";

export async function checkRedirectToVerify(
  user:User|null,
  pageRouteKind:PageRouteKind,
) {
  let stringEmailVerifiedAt:string|null = null;
        
  if(pageRouteKind !== PageRouteKind.VERIFY){
    if(user){
      if(user.emailVerifiedAt){
        stringEmailVerifiedAt =
          user.emailVerifiedAt.toISOString();
      }
      if(stringEmailVerifiedAt){
        if(
          getCanResendVerificationEmailFromStringDate(
            stringEmailVerifiedAt
          ) === true
        ){
          redirect(`/verify?reason=before_server_component_from_${pageRouteKind}`);
        }
      }else{//stringEmailVerifiedAt
        redirect(`/verify?reason=before_server_component_from_${pageRouteKind}`);
      }//stringEmailVerifiedAt
    }else{

    }//user
  }//pageRouteKind
  
}