import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";
export default async function Dashboard() { const user=await getCurrentUser(); if(!user) redirect("/login"); const configs=await db.apiConfig.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},include:{_count:{select:{logs:true}}}}); const proxies=await db.proxyEndpoint.count({where:{userId:user.id}}); return <DashboardClient username={user.username} initialConfigs={configs.map(c=>({id:c.id,name:c.name,provider:c.provider,baseUrl:c.baseUrl,model:c.defaultModel,key:`sk-tx-••••${c.gatewayKeyLast4}`,active:c.active,logs:c._count.logs}))} proxyCount={proxies}/>; }
