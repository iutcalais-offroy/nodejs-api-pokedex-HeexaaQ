import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import authRouter from "../src/routes/auth.routes";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prismaMock } from "./vitest.setup";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/sign-up", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/api/auth/sign-up").send({
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Données manquantes" });
    });

    it("should return 400 if username is missing", async () => {
      const response = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Données manquantes" });
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        username: "testuser",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Données manquantes" });
    });

    it("should return 409 if email already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        username: "existinguser",
        password: "hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: "Email déjà utilisé" });
    });

    it("should create a new user and return token", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const hashedPassword = "hashedpassword123";
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as any);

      const newUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.create.mockResolvedValue(newUser);

      const token = "jwt-token-123";
      vi.mocked(jwt.sign).mockReturnValue(token as any);

      const response = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token", token);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/auth/sign-up").send({
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Erreur serveur lors de l'inscription",
      });
    });
  });

  describe("POST /api/auth/sign-in", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app).post("/api/auth/sign-in").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Données manquantes" });
    });

    it("should return 400 if password is missing", async () => {
      const response = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Données manquantes" });
    });

    it("should return 401 if user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Identifiants incorrects" });
    });

    it("should return 401 if password is invalid", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any);

      const response = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Identifiants incorrects" });
    });

    it("should return token if credentials are valid", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedpassword",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

      const token = "jwt-token-123";
      vi.mocked(jwt.sign).mockReturnValue(token as any);

      const response = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token", token);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).not.toHaveProperty("password");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should return 500 if database error occurs", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/auth/sign-in").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Erreur serveur lors de la connexion",
      });
    });
  });
});
