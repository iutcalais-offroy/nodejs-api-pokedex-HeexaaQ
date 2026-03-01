import { Response, NextFunction } from 'express'
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env'

/**
 * Middleware d'authentification JWT pour les routes protégées
 * Vérifie le token dans le header Authorization et ajoute les infos user à req.user
 *
 * @param {Request} req - Requête avec header Authorization: "Bearer <token>"
 * @param {Response} res - Réponse Express
 * @param {NextFunction} next - Fonction pour continuer
 *
 * @returns {void} Appelle next() si valide
 * @throws {401} Si token absent ou invalide
 *
 * @example
 * router.get('/protected', authenticateToken, (req, res) => {
 *   const userId = req.user.userId
 * })
 */
export const authenticateToken = (
  req: Request<unknown, unknown, unknown>,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: number
      email: string
    }
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
