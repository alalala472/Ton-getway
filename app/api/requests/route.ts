import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
export async function GET(req:Request){const user=await getCurrentUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const url=new URL(req.url);const configId=url.searchParams.get("config");const logs=await db.requestLog.findMany({where:{userId:user.id,...(configId?{configId}:{})},orderBy:{createdAt:"desc"},take:100});return NextResponse.json({logs});}
