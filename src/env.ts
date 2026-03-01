import dotenv from 'dotenv'

dotenv.config()

/**
 * Configuration des variables d'environnement de l'application
 * Charge les variables depuis le fichier .env à la racine du projet
 *
 * @constant {Object} env - Variables d'environnement avec valeurs par défaut
 * @property {number|string} PORT - Port du serveur (défaut: 3000)
 * @property {string} JWT_SECRET - Clé secrète pour signer les tokens JWT (défaut: 'default-secret')
 * @property {string} DATABASE_URL - URL de connexion PostgreSQL (défaut: 'file:./dev.db')
 * @property {string} NODE_ENV - Environnement d'exécution: development, production, test
 *
 * @example
 * // Dans .env
 * PORT=3000
 * JWT_SECRET=mon_secret_super_securise
 * DATABASE_URL=postgresql://user:password@localhost:5432/pokedex
 * NODE_ENV=development
 */
export const env = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: (process.env.JWT_SECRET || 'default-secret') as string,
  DATABASE_URL: (process.env.DATABASE_URL || 'file:./dev.db') as string,
  NODE_ENV: (process.env.NODE_ENV || 'development') as string,
}
