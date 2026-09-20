import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret, createGatewayKey, hashToken } from "@/lib/crypto";
import { configSchema } from "@/lib/validators";
export async function POST(req:Request){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=configSchema.safeParse(await req.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||"Invalid input"},{status:400});const d=parsed.data;const gatewayKey=createGatewayKey();const c=await db.apiConfig.create({data:{userId:user.id,name:d.name,provider:d.provider,baseUrl:d.baseUrl.replace(/\/$/,""),encryptedApiKey:encryptSecret(d.apiKey),gatewayKeyHash:hashToken(gatewayKey),gatewayKeyLast4:gatewayKey.slice(-4),defaultModel:d.defaultModel||null,logMode:d.logMode,maxRequestsPerMin:d.maxRequestsPerMin??null,proxyEnabled:d.proxyEnabled}});await db.gatewayKeyHistory.create({data:{configId:c.id,keyLast4:c.gatewayKeyLast4}});return NextResponse.json({id:c.id,gatewayKey});}
