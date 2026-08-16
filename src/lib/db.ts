import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma'

const connectionString =
  process.env.DATABASE_URL ?? process.env.DIRECT_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const adapter = new PrismaNeon({
  connectionString,
})

export const prisma = new PrismaClient({ adapter })
