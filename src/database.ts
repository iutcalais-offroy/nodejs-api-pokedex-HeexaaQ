import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'
import { env } from './env'

/**
 * Configuration de la connexion à la base de données
 * Utilise l'adapteur PostgreSQL avec Prisma pour gérer les opérations BDD
 *
 * @constant {PrismaClient} prisma - Instance Prisma client configurée avec PostgreSQL
 * @example
 * // Utilisation dans les routes
 * const users = await prisma.user.findMany()
 * const card = await prisma.card.findUnique({ where: { id: 1 } })
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
