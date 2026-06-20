import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { User} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getServerSessionUser():Promise<User|null>{
    const session = await getServerSession(authOptions);
    let user:User|null = null;

    if(session){
        user = await prisma.user.findUnique({
        where:{
            id: session.user.id
        }
        });
    }//session

    return user;

}

