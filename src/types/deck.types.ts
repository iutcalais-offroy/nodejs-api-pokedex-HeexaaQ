import type { Request } from 'express'

export interface CreateDeckBody {
  name: string
  cards: number[]
}

export interface UpdateDeckBody {
  name: string
  cards: number[]
}

export interface DeckParams {
  id: string
}

export type CreateDeckRequest = Request<unknown, unknown, CreateDeckBody>

export type UpdateDeckRequest = Request<DeckParams, unknown, UpdateDeckBody>

export type GetDeckRequest = Request<DeckParams, unknown, unknown>

export type DeleteDeckRequest = Request<DeckParams, unknown, unknown>
