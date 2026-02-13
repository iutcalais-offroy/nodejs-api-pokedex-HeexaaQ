import { describe, expect, it, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/index'
import { prismaMock } from './vitest.setup'
import jwt from 'jsonwebtoken'
import { env } from '../src/env'

const mockDeck = {
  id: 1,
  name: 'Test Deck',
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

let authToken: string

beforeAll(() => {
  authToken = jwt.sign(
    { userId: 1, email: 'blue@example.com' },
    env.JWT_SECRET,
    { expiresIn: '7d' },
  )
})

describe('POST /decks', () => {
  it('should create a new deck with 10 cards', async () => {
    prismaMock.deck.create.mockResolvedValueOnce({
      ...mockDeck,
      name: 'My Test Deck',
    })

    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'My Test Deck',
        cards: mockCards,
      })
      .expect(201)
    expect(response.body).toContain('deck created successfully')
  })

  it('should not create a deck without authentication', async () => {
    const response = await request(app)
      .post('/api/decks')
      .send({
        name: 'Unauthorized Deck',
        cards: mockCards,
      })
      .expect(401)
    expect(response.body).toHaveProperty('error', 'No token provided')
  })

  it('should not create a deck without a name', async () => {
    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '',
        cards: mockCards,
      })
      .expect(400)
    expect(response.body).toBe('Missing deck name')
  })

  it('should not create a deck with less than 10 cards', async () => {
    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Incomplete Deck',
        cards: [1, 2, 3],
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })

  it('should not create a deck with more than 10 cards', async () => {
    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Too Many Cards Deck',
        cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })

  it('should not create a deck without cards array', async () => {
    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'No Cards Deck',
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })
})

describe('GET /decks/mine', () => {
  it('should retrieve all decks for authenticated user', async () => {
    prismaMock.deck.findMany.mockResolvedValueOnce([
      { ...mockDeck, name: 'Deck 1' },
      { ...mockDeck, id: 2, name: 'Deck 2' },
    ])

    const response = await request(app)
      .get('/api/decks/mine')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
    expect(Array.isArray(response.body)).toBe(true)
    response.body.forEach((deck: { id: number; name: string }) => {
      expect(deck).toHaveProperty('id')
      expect(deck).toHaveProperty('name')
    })
  })

  it('should not retrieve decks without authentication', async () => {
    const response = await request(app).get('/api/decks/mine').expect(401)
    expect(response.body).toHaveProperty('error', 'No token provided')
  })
})

describe('GET /decks/:id', () => {
  it('should retrieve a specific deck by ID', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce(mockDeck)

    const response = await request(app)
      .get(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
    expect(response.body).toHaveProperty('id', 1)
    expect(response.body).toHaveProperty('name')
  })

  it('should not retrieve a deck without authentication', async () => {
    const response = await request(app).get(`/api/decks/1`).expect(401)
    expect(response.body).toHaveProperty('error', 'No token provided')
  })

  it('should return 400 for invalid deck ID', async () => {
    const response = await request(app)
      .get('/api/decks/invalid')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400)
    expect(response.body).toBe('Invalid deck ID')
  })

  it('should return 404 for non-existent deck', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce(null)

    const response = await request(app)
      .get('/api/decks/99999')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)
    expect(response.body).toHaveProperty('error', 'Deck not found')
  })
})

describe('PATCH /decks/:id', () => {
  it('should update a deck name and cards', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce({
      ...mockDeck,
      name: 'Old Name',
    })
    prismaMock.deck.update.mockResolvedValueOnce({
      ...mockDeck,
      name: 'Updated Deck Name',
    })

    const response = await request(app)
      .patch(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Deck Name',
        cards: mockCards,
      })
      .expect(200)
    expect(response.body).toContain('Deck updated successfully')
  })

  it('should not update a deck without authentication', async () => {
    const response = await request(app)
      .patch(`/api/decks/1`)
      .send({
        name: 'Unauthorized Update',
        cards: mockCards,
      })
      .expect(401)
    expect(response.body).toHaveProperty('error', 'No token provided')
  })

  it('should not update a deck without a name', async () => {
    const response = await request(app)
      .patch(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '', cards: mockCards })
      .expect(400)
    expect(response.body).toBe('Missing deck name')
  })

  it('should return 400 for invalid deck ID', async () => {
    const response = await request(app)
      .patch('/api/decks/invalid')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated',
        cards: mockCards,
      })
      .expect(400)
    expect(response.body).toBe('Invalid deck ID')
  })

  it('should not update a deck without cards', async () => {
    const response = await request(app)
      .patch(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })

  it('should not update a deck with less than 10 cards', async () => {
    const response = await request(app)
      .patch(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
        cards: [1, 2, 3],
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })

  it('should not update a deck with more than 10 cards', async () => {
    const response = await request(app)
      .patch(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated Name',
        cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      })
      .expect(400)
    expect(response.body).toBe('A deck must contain exactly 10 cards')
  })

  it('should return 404 for non-existent deck', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce(null)

    const response = await request(app)
      .patch('/api/decks/99999')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated',
        cards: mockCards,
      })
      .expect(404)
    expect(response.body).toHaveProperty('error', 'Deck not found')
  })
})

describe('DELETE /decks/:id', () => {
  it('should delete a deck by ID', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce(mockDeck)
    prismaMock.deck.delete.mockResolvedValueOnce(mockDeck)

    const response = await request(app)
      .delete(`/api/decks/1`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
    expect(response.body).toBe('Deck deleted successfully')
  })

  it('should not delete a deck without authentication', async () => {
    const response = await request(app).delete(`/api/decks/1`).expect(401)
    expect(response.body).toHaveProperty('error', 'No token provided')
  })

  it('should return 400 for invalid deck ID', async () => {
    const response = await request(app)
      .delete('/api/decks/invalid')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400)
    expect(response.body).toBe('Invalid deck ID')
  })

  it('should return 404 for non-existent deck', async () => {
    prismaMock.deck.findFirst.mockResolvedValueOnce(null)

    const response = await request(app)
      .delete('/api/decks/99999')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404)
    expect(response.body).toHaveProperty('error', 'Deck not found')
  })
})

describe('Error handling - 500 errors', () => {
  it('should return 500 when database fails on deck creation', async () => {
    prismaMock.deck.create.mockRejectedValueOnce(new Error('DB Error'))

    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Error Deck',
        cards: mockCards,
      })
      .expect(500)

    expect(response.body).toHaveProperty('error', 'Internal server error')
  })

  it('should return 500 when database fails on get mine', async () => {
    prismaMock.deck.findMany.mockRejectedValueOnce(new Error('DB Error'))

    const response = await request(app)
      .get('/api/decks/mine')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(500)

    expect(response.body).toHaveProperty('error', 'Internal server error')
  })

  it('should return 500 when database fails on get by id', async () => {
    prismaMock.deck.findFirst.mockRejectedValueOnce(new Error('DB Error'))

    const response = await request(app)
      .get('/api/decks/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(500)

    expect(response.body).toHaveProperty('error', 'Internal server error')
  })

  it('should return 500 when database fails on update', async () => {
    prismaMock.deck.findFirst.mockRejectedValueOnce(new Error('DB Error'))

    const response = await request(app)
      .patch('/api/decks/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Updated',
        cards: mockCards,
      })
      .expect(500)

    expect(response.body).toHaveProperty('error', 'Internal server error')
  })

  it('should return 500 when database fails on delete', async () => {
    prismaMock.deck.findFirst.mockRejectedValueOnce(new Error('DB Error'))

    const response = await request(app)
      .delete('/api/decks/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(500)

    expect(response.body).toHaveProperty('error', 'Internal server error')
  })
})
