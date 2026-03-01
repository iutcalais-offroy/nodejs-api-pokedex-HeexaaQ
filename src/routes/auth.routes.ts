import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { env } from '../env'

import { SignUpRequest, SignInRequest } from '../types/auth.types'

const router = Router()

/**
 * Route d'inscription - Crée un nouveau compte utilisateur
 * Hash le mot de passe et génère un token JWT valide 7 jours
 *
 * @route POST /api/auth/sign-up
 * @access Public
 *
 * @param {string} req.body.email - Email unique
 * @param {string} req.body.username - Nom d'utilisateur
 * @param {string} req.body.password - Mot de passe (sera hashé)
 *
 * @returns {201} { token: string, user: User } - Token et infos utilisateur
 * @throws {400} Données manquantes
 * @throws {409} Email déjà utilisé
 * @throws {500} Erreur serveur
 */
router.post('/sign-up', async (req: SignUpRequest, res: Response) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Données manquantes' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Email déjà utilisé' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user
    return res.status(201).json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: "Erreur serveur lors de l'inscription" })
  }
})

/**
 * Route de connexion - Authentifie un utilisateur existant
 * Vérifie l'email et le mot de passe puis génère un token JWT
 *
 * @route POST /api/auth/sign-in
 * @access Public
 *
 * @param {string} req.body.email - Email du compte
 * @param {string} req.body.password - Mot de passe
 *
 * @returns {200} { token: string, user: User } - Token et infos utilisateur
 * @throws {400} Données manquantes
 * @throws {401} Identifiants incorrects
 * @throws {500} Erreur serveur
 */
router.post('/sign-in', async (req: SignInRequest, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Données manquantes' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user
    return res.status(200).json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: 'Erreur serveur lors de la connexion' })
  }
})

export default router
