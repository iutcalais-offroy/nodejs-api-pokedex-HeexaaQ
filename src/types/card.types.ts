import {Request} from 'express';

export interface AllCardRequestBody {
    id: number;
    name: string;
    hp: number;
    attack: number;
    type: string;
    pokedexNumber: number;
    imUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

export type AllCardRequest = Request<{}, any, AllCardRequestBody[]>;