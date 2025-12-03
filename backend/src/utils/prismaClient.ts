import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient instance
let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  return prisma;
}

export async function closePrismaClient(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export default getPrismaClient();
