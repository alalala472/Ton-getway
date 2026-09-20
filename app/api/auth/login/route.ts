import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
export async function POST(req: Request){const body=await req.json().catch(()=>({}));const user=await db.user.findUnique({where:{username:String(body.username||"")}});if(!user||!(await bcrypt.compare(String(body.password||""),user.passwordHash)))return NextResponse.json({error:"Invalid credentials"},{status:401});await createSession(user.id,Boolean(body.remember));return NextResponse.json({ok:true});}
