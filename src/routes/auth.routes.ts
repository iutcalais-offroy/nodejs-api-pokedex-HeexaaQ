import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { env } from '../env'

import { SignUpRequest, SignInRequest } from '../types/auth.types'

const router = Router()

/**
 * POST /api/auth/sign-up
 * Inscription d'un nouvel utilisateur
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
 * POST /api/auth/sign-in
 * Connexion d'un utilisateur existant
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
