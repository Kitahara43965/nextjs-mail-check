import type { User} from "@prisma/client";
import { redirect } from "next/navigation";
import {getCanResendVerificationEmailFromStringDate}
  from "@/services/tool/can-resend-verification-email.service";
import { PageRouteKind } from "@/enums/page-route-kind.enum";

export async function checkRedirectToDashboard(
  user:User|null,
  pageRouteKind:PageRouteKind,
) {
  let stringEmailVerifiedAt:string|null = null;
  let stringRedirectedRoute:string|null = null;
        
  if(pageRouteKind !== PageRouteKind.DASHBOARD){
    if(user){
      if(user.emailVerifiedAt){
        stringEmailVerifiedAt =
          user.emailVerifiedAt.toISOString();
      }
      if(stringEmailVerifiedAt){
        if(
          getCanResendVerificationEmailFromStringDate(
            stringEmailVerifiedAt
          ) === false
        ){
          stringRedirectedRoute = `/dashboard?reason=before_server_component_from_${pageRouteKind}`;
        }
      }//stringEmailVerifiedAt
    }//user
  }//pageRouteKind

  if(stringRedirectedRoute){
    redirect(stringRedirectedRoute);
  }//stringRedirectedRoute
  
}