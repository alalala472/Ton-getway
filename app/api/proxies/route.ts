import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/crypto";
export async function GET(){const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const items=await db.proxyEndpoint.findMany({where:{userId:u.id},select:{id:true,name:true,enabled:true,status:true,latencyMs:true,lastCheckedAt:true,lastError:true}});return NextResponse.json({items});}
export async function POST(req:Request){const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json();const p=await db.proxyEndpoint.create({data:{userId:u.id,name:b.name,urlEncrypted:encryptSecret(b.url),username:b.username||null,passwordEncrypted:b.password?encryptSecret(b.password):null}});return NextResponse.json({id:p.id});}
