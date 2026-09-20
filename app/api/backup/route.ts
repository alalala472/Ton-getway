import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
export async function GET(){const u=await getCurrentUser();if(!u)return NextResponse.json({error:"Unauthorized"},{status:401});const configs=await db.apiConfig.findMany({where:{userId:u.id},select:{name:true,provider:true,baseUrl:true,defaultModel:true,active:true,logMode:true,maxRequestsPerMin:true,proxyEnabled:true}});return NextResponse.json({version:1,exportedAt:new Date().toISOString(),configs});}
