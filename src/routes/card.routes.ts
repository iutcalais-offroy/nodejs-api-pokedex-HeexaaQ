import {Router, Response} from "express";
import {prisma} from "../database";
import {AllCardRequest} from "../types/card.types";

export const cardRouter = Router();

cardRouter.get("/", async (_req: AllCardRequest, res: Response) => {
    try {
        const cards = await prisma.card.findMany({
            orderBy: {
                pokedexNumber: 'asc'
            }
        });
        
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
});