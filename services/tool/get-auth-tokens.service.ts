import type { User, AuthToken,AuthTokenType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAuthTokens(
    userId:string|null,
    authTokenType:AuthTokenType,
):Promise<AuthToken[]|null>{
    let authTokens:AuthToken[]|null = null;

    if(typeof userId === "string"){
        authTokens = await prisma.authToken.findMany({
            where: {
                user: {
                    id: userId,
                },
                authTokenType: authTokenType,
            },
        });
    }//typeof authTokenUserId

    return authTokens;

}