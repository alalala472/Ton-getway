import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || "Tondois";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD is required for seeding.");
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
}

main().finally(() => db.$disconnect());
