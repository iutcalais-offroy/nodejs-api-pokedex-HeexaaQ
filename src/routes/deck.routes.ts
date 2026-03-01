import { Router, Response } from 'express'
import type { Request } from 'express'
import { prisma } from '../database'
import { authenticateToken } from '../middleware/auth.middleware'
import {
  CreateDeckRequest,
  UpdateDeckRequest,
  GetDeckRequest,
  DeleteDeckRequest,
} from '../types/deck.types'

export const deckRouter = Router()

/**
 * Route pour créer un nouveau deck de 10 cartes
 * Le deck est associé à l'utilisateur connecté
 *
 * @route POST /api/decks
 * @access Protégé (JWT requis)
 *
 * @param {string} req.body.name - Nom du deck
 * @param {number[]} req.body.cards - Tableau de 10 IDs de cartes
 *
 * @returns {201} Message de confirmation avec nom du deck
 * @throws {400} Nom manquant ou nombre de cartes invalide
 * @throws {401} Token manquant/invalide
 * @throws {500} Erreur serveur
 */
deckRouter.post(
  '/',
  authenticateToken,
  async (req: CreateDeckRequest, res: Response) => {
    try {
      const name = req.body.name
      const userId = req.user!.userId
      const cards = req.body.cards

      if (!name) {
        return res.status(400).json('Missing deck name')
      }

      if (!cards || !Array.isArray(cards) || cards.length !== 10) {
        return res.status(400).json('A deck must contain exactly 10 cards')
      }

      const deck = await prisma.deck.create({
        data: {
          name: name,
          userId: userId,
          cards: {
            create: cards.map((cardId: number) => ({ cardId })),
          },
        },
      })

      return res.status(201).json('deck created successfully :' + deck.name)
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
)

/**
 * Route pour récupérer tous les decks de l'utilisateur connecté
 * Retourne une liste simplifiée (ID et nom uniquement)
 *
 * @route GET /api/decks/mine
 * @access Protégé (JWT requis)
 *
 * @returns {200} Array<{id: number, name: string}> - Liste des decks
 * @throws {401} Token manquant/invalide
 * @throws {500} Erreur serveur
 */
deckRouter.get(
  '/mine',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.userId

      const decks = await prisma.deck.findMany({
        where: { userId: userId },
      })
      return res.status(200).json(
        decks.map((deck) => ({
          id: deck.id,
          name: deck.name,
        })),
      )
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
)

/**
 * Route pour récupérer les détails complets d'un deck spécifique par son ID
 * Ne retourne que les decks appartenant à l'utilisateur connecté
 *
 * @route GET /api/decks/:id
 * @access Protégé (nécessite token JWT valide)
 *
 * @param {GetDeckRequest} req - Requête contenant l'ID du deck
 * @param {string} req.params.id - ID numérique du deck à récupérer
 * @param {Response} res - Réponse avec les détails du deck
 *
 * @returns {200} Deck trouvé - Objet Deck complet avec toutes ses propriétés
 * @throws {400} "Invalid deck ID" - Si l'ID n'est pas un nombre valide
 * @throws {401} Erreur d'authentification - Si token absent ou invalide (middleware)
 * @throws {404} "Deck not found" - Si le deck n'existe pas ou n'appartient pas à l'utilisateur
 * @throws {500} "Internal server error" - Erreur lors de la récupération en base
 *
 * @example
 * GET /api/decks/1
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * // Réponse 200
 * {
 *   "id": 1,
 *   "name": "Deck Feu",
 *   "userId": 1,
 *   "createdAt": "2026-03-01T10:00:00.000Z",
 *   "updatedAt": "2026-03-01T10:00:00.000Z"
 * }
 */
deckRouter.get(
  '/:id',
  authenticateToken,
  async (req: GetDeckRequest, res: Response) => {
    try {
      const userId = req.user!.userId
      const deckId = parseInt(req.params.id!)

      if (isNaN(deckId)) {
        return res.status(400).json('Invalid deck ID')
      }

      const deck = await prisma.deck.findFirst({
        where: { id: deckId, userId },
      })

      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' })
      }

      return res.status(200).json(deck)
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
)

/**
 * Route pour modifier un deck existant (nom et/ou cartes)
 * Les anciennes cartes sont remplacées par les nouvelles
 *
 * @route PATCH /api/decks/:id
 * @access Protégé (JWT requis)
 *
 * @param {string} req.params.id - ID du deck
 * @param {string} req.body.name - Nouveau nom
 * @param {number[]} req.body.cards - Nouveau tableau de 10 IDs de cartes
 *
 * @returns {200} Message de confirmation
 * @throws {400} ID/nom invalide ou nombre de cartes incorrect
 * @throws {401} Token manquant/invalide
 * @throws {404} Deck introuvable
 * @throws {500} Erreur serveur
 */
deckRouter.patch(
  '/:id',
  authenticateToken,
  async (req: UpdateDeckRequest, res: Response) => {
    try {
      const userId = req.user!.userId
      const deckId = parseInt(req.params.id ?? '')
      const { name, cards } = req.body

      if (isNaN(deckId)) {
        return res.status(400).json('Invalid deck ID')
      }

      if (!name) {
        return res.status(400).json('Missing deck name')
      }

      if (!cards || !Array.isArray(cards) || cards.length !== 10) {
        return res.status(400).json('A deck must contain exactly 10 cards')
      }

      const deck = await prisma.deck.findFirst({
        where: { userId, id: deckId },
      })

      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' })
      }

      const updatedDeck = await prisma.deck.update({
        where: { userId, id: deckId },
        data: {
          name: name,
          cards: {
            deleteMany: {
              deckId: deckId,
            },
            create: cards.map((cardId: number) => ({ cardId })),
          },
        },
      })
      return res.status(200).json('Deck updated successfully' + updatedDeck)
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
)

/**
 * Route pour supprimer un deck et ses associations avec les cartes
 * Suppression en cascade des entrées DeckCard
 *
 * @route DELETE /api/decks/:id
 * @access Protégé (JWT requis)
 *
 * @param {string} req.params.id - ID du deck à supprimer
 *
 * @returns {200} Message "Deck deleted successfully"
 * @throws {400} ID invalide
 * @throws {401} Token manquant/invalide
 * @throws {404} Deck introuvable
 * @throws {500} Erreur serveur
 */
deckRouter.delete(
  '/:id',
  authenticateToken,
  async (req: DeleteDeckRequest, res: Response) => {
    try {
      const userId = req.user!.userId
      const deckId = parseInt(req.params.id ?? '')

      if (isNaN(deckId)) {
        return res.status(400).json('Invalid deck ID')
      }

      const deck = await prisma.deck.findFirst({
        where: { userId, id: deckId },
      })

      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' })
      }

      await prisma.deck.delete({
        where: { userId, id: deckId },
      })
      return res.status(200).json('Deck deleted successfully')
    } catch {
      return res.status(500).json({ error: 'Internal server error' })
    }
  },
)

export default deckRouter
