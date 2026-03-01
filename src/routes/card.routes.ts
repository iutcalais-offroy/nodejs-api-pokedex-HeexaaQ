import { Router, Response } from 'express'
import { prisma } from '../database'
import { AllCardRequest } from '../types/card.types'

export const cardRouter = Router()

/**
 * Route pour récupérer toutes les cartes Pokemon disponibles
 * Les cartes sont triées par numéro de Pokédex
 *
 * @route GET /api/cards
 * @access Public
 *
 * @returns {200} Array<Card> - Liste des cartes avec id, name, type, hp, attack, imgUrl, etc.
 * @throws {500} Erreur serveur
 */
cardRouter.get('/', async (_req: AllCardRequest, res: Response) => {
  try {
    const cards = await prisma.card.findMany({
      orderBy: {
        pokedexNumber: 'asc',
      },
    })

    res.status(200).json(cards)
  } catch (err) {
    console.error('Error fetching cards:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
