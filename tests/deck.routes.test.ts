import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import deckRouter from "../src/routes/deck.routes";
import { prismaMock } from "./vitest.setup";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/decks", deckRouter);

const mockToken = "Bearer mock-jwt-token";
const mockUserId = 1;
const mockEmail = "test@example.com";

describe("Deck Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock JWT verification
    vi.mocked(jwt.verify).mockReturnValue({
      userId: mockUserId,
      email: mockEmail,
    } as any);
  });

  describe("POST /api/decks", () => {
    it("should return 401 if no token is provided", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("No token");
      });

      const response = await request(app)
        .post("/api/decks")
        .send({
          name: "My Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(401);
    });

    it("should return 400 if deck name is missing", async () => {
      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Missing deck name");
    });

    it("should return 400 if cards array is missing", async () => {
      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          name: "My Deck",
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("A deck must contain exactly 10 cards");
    });

    it("should return 400 if cards array is not an array", async () => {
      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          name: "My Deck",
          cards: "not-an-array",
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("A deck must contain exactly 10 cards");
    });

    it("should return 400 if cards array does not have exactly 10 cards", async () => {
      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          name: "My Deck",
          cards: [1, 2, 3],
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("A deck must contain exactly 10 cards");
    });

    it("should create a deck successfully", async () => {
      const mockDeck = {
        id: 1,
        name: "My Deck",
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.deck.create.mockResolvedValue(mockDeck);

      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          name: "My Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(201);
      expect(response.body).toBe("deck created successfully :My Deck");
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.deck.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", mockToken)
        .send({
          name: "My Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /api/decks/mine", () => {
    it("should return 401 if no token is provided", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("No token");
      });

      const response = await request(app).get("/api/decks/mine");

      expect(response.status).toBe(401);
    });

    it("should return all user decks", async () => {
      const mockDecks = [
        {
          id: 1,
          name: "Deck 1",
          userId: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Deck 2",
          userId: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.deck.findMany.mockResolvedValue(mockDecks);

      const response = await request(app)
        .get("/api/decks/mine")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: "Deck 1" },
        { id: 2, name: "Deck 2" },
      ]);
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.deck.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/decks/mine")
        .set("Authorization", mockToken);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /api/decks/:id", () => {
    it("should return 401 if no token is provided", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("No token");
      });

      const response = await request(app).get("/api/decks/1");

      expect(response.status).toBe(401);
    });

    it("should return 400 if deck ID is invalid", async () => {
      const response = await request(app)
        .get("/api/decks/invalid")
        .set("Authorization", mockToken);

      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid deck ID");
    });

    it("should return 404 if deck is not found", async () => {
      prismaMock.deck.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Deck not found" });
    });

    it("should return deck if found", async () => {
      const now = new Date();
      const mockDeck = {
        id: 1,
        name: "My Deck",
        userId: mockUserId,
        createdAt: now,
        updatedAt: now,
      };

      prismaMock.deck.findFirst.mockResolvedValue(mockDeck);

      const response = await request(app)
        .get("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        name: "My Deck",
        userId: mockUserId,
      });
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.deck.findFirst.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("PATCH /api/decks/:id", () => {
    it("should return 401 if no token is provided", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("No token");
      });

      const response = await request(app)
        .patch("/api/decks/1")
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(401);
    });

    it("should return 400 if deck ID is invalid", async () => {
      const response = await request(app)
        .patch("/api/decks/invalid")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid deck ID");
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("Missing deck name");
    });

    it("should return 400 if cards array is missing", async () => {
      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("A deck must contain exactly 10 cards");
    });

    it("should return 400 if cards array is not valid", async () => {
      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3],
        });

      expect(response.status).toBe(400);
      expect(response.body).toBe("A deck must contain exactly 10 cards");
    });

    it("should return 404 if deck is not found", async () => {
      prismaMock.deck.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Deck not found" });
    });

    it("should update deck successfully", async () => {
      const mockDeck = {
        id: 1,
        name: "My Deck",
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedDeck = {
        ...mockDeck,
        name: "Updated Deck",
      };

      prismaMock.deck.findFirst.mockResolvedValue(mockDeck);
      prismaMock.deck.update.mockResolvedValue(updatedDeck);

      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(200);
      expect(response.body).toContain("Deck updated successfully");
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.deck.findFirst.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .patch("/api/decks/1")
        .set("Authorization", mockToken)
        .send({
          name: "Updated Deck",
          cards: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("DELETE /api/decks/:id", () => {
    it("should return 401 if no token is provided", async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error("No token");
      });

      const response = await request(app).delete("/api/decks/1");

      expect(response.status).toBe(401);
    });

    it("should return 400 if deck ID is invalid", async () => {
      const response = await request(app)
        .delete("/api/decks/invalid")
        .set("Authorization", mockToken);

      expect(response.status).toBe(400);
      expect(response.body).toBe("Invalid deck ID");
    });

    it("should return 404 if deck is not found", async () => {
      prismaMock.deck.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Deck not found" });
    });

    it("should delete deck successfully", async () => {
      const mockDeck = {
        id: 1,
        name: "My Deck",
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.deck.findFirst.mockResolvedValue(mockDeck);
      prismaMock.deck.delete.mockResolvedValue(mockDeck);

      const response = await request(app)
        .delete("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(200);
      expect(response.body).toBe("Deck deleted successfully");
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.deck.findFirst.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .delete("/api/decks/1")
        .set("Authorization", mockToken);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });
});
