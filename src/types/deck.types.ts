import type {Request} from 'express';

export interface CreateDeckBody {
    name: string;
    cards: number[];
}

export interface UpdateDeckBody {
    name: string;
    cards: number[];
}

export type CreateDeckRequest = Request<any, any, CreateDeckBody>;

export type UpdateDeckRequest = Request<any, any, UpdateDeckBody>;