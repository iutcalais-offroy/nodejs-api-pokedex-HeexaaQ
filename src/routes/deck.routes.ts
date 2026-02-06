import {Router, Response} from "express";
import type {Request} from "express";
import {prisma} from "../database";
import {authenticateToken} from "../middleware/auth.middleware";
import {CreateDeckRequest, UpdateDeckRequest} from "../types/deck.types";

export const deckRouter = Router();

deckRouter.post("/", authenticateToken, async (req: CreateDeckRequest, res: Response) => {
    try {
        const name = req.body.name;
        const userId = req.user!.userId;
        const cards = req.body.cards;

        if (!name) {
            return res.status(400).json("Missing deck name");
        }

        if (!cards || !Array.isArray(cards) || cards.length !== 10) {
            return res.status(400).json("A deck must contain exactly 10 cards");
        }

        const deck = await prisma.deck.create({
            data: {
                name: name,
                userId: userId,
                cards : {
                    create: cards.map((cardId: number) => ({ cardId }))
                }
            }
        });

        return res.status(201).json("deck created successfully :" + deck.name);
    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }
});


deckRouter.get("/mine", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const decks = await prisma.deck.findMany({
            where: {userId: userId}
        })
        return res.status(200).json(decks.map(deck => ({
            id: deck.id,
            name: deck.name
        })));
    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }
});

deckRouter.get("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const deckId = parseInt(req.params.id!);

        if (isNaN(deckId)) {
            return res.status(400).json("Invalid deck ID");
        }

        const deck = await prisma.deck.findFirst({
            where: {id: deckId, userId}
        })
        
        if (!deck) {
            return res.status(404).json({error: "Deck not found"});
        }
        
        return res.status(200).json(deck);
    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }
}
);

deckRouter.patch("/:id", authenticateToken, async (req: UpdateDeckRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const deckId = parseInt(req.params.id!);
        const {name, cards} = req.body;

        if (isNaN(deckId)) {
            return res.status(400).json("Invalid deck ID");
        }

        if (!name) {
            return res.status(400).json("Missing deck name");
        }

        if (!cards || !Array.isArray(cards) || cards.length !== 10) {
            return res.status(400).json("A deck must contain exactly 10 cards");
        }

        const deck = await prisma.deck.findFirst({
            where: {userId, id: deckId}
        });

        if (!deck) {
            return res.status(404).json({error: "Deck not found"});
        }

        const updatedDeck = await prisma.deck.update({
            where: {userId, id:deckId},
            data: {
                name: name,
                cards: {
                    deleteMany: {
                        deckId: deckId,
                    },
                        create: cards.map((cardId: number) => ({ cardId })),
                    }
                }
            });
        return res.status(200).json("Deck updated successfully" + updatedDeck);
    } catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }
});

deckRouter.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const deckId = parseInt(req.params.id!);

        if (isNaN(deckId)) {
            return res.status(400).json("Invalid deck ID");
        }

        const deck = await prisma.deck.findFirst({
            where: {userId, id: deckId}
        });

        if (!deck) {
            return res.status(404).json({error: "Deck not found"});
        }

        await prisma.deck.delete({
            where: {userId, id:deckId},
        });
        return res.status(200).json("Deck deleted successfully"); 
    }
    catch (error) {
        return res.status(500).json({error: "Internal server error"});
    }
});

export default deckRouter;