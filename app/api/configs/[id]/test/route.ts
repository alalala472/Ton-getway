import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";
import { adapterFor } from "@/lib/providers";
export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const c=await db.apiConfig.findFirst({where:{id,userId:user.id}});if(!c)return NextResponse.json({error:"Not found"},{status:404});const result=await adapterFor(c.provider).test(c.baseUrl,decryptSecret(c.encryptedApiKey));await db.apiConfig.update({where:{id},data:{lastHealthStatus:result.ok?"HEALTHY":"FAILED",lastHealthAt:new Date(),lastError:result.ok?null:result.message}});return NextResponse.json(result,{status:result.ok?200:502});}
