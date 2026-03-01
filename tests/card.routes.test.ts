import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { cardRouter } from "../src/routes/card.routes";
import { prismaMock } from "./vitest.setup";

const app = express();
app.use(express.json());
app.use("/api/cards", cardRouter);

describe("Card Routes", () => {
  beforeEach(() => {
    // Nothing to clear since we're using prismaMock from setup
  });

  describe("GET /api/cards", () => {
    it("should return all cards ordered by pokedex number", async () => {
      const now = new Date();
      const mockCards = [
        {
          id: 1,
          name: "Bulbasaur",
          pokedexNumber: 1,
          type: "Grass" as any,
          hp: 45,
          attack: 49,
          imgUrl: "https://example.com/bulbasaur.png",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          name: "Ivysaur",
          pokedexNumber: 2,
          type: "Grass" as any,
          hp: 60,
          attack: 62,
          imgUrl: "https://example.com/ivysaur.png",
          createdAt: now,
          updatedAt: now,
        },
      ];

      prismaMock.card.findMany.mockResolvedValue(mockCards);

      const response = await request(app).get("/api/cards");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 1,
        name: "Bulbasaur",
        pokedexNumber: 1,
        type: "Grass",
        hp: 45,
        attack: 49,
      });
      expect(response.body[1]).toMatchObject({
        id: 2,
        name: "Ivysaur",
        pokedexNumber: 2,
        type: "Grass",
        hp: 60,
        attack: 62,
      });
      expect(prismaMock.card.findMany).toHaveBeenCalledWith({
        orderBy: {
          pokedexNumber: "asc",
        },
      });
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.card.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/cards");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
