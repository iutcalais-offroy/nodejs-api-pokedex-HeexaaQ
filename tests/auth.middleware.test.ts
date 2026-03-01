import { describe, it, expect, vi } from "vitest";
import { authenticateToken } from "../src/middleware/auth.middleware";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

vi.mock("jsonwebtoken");

describe("authenticateToken", () => {
  it("should return 401 if no token is provided", () => {
    const req = {
      headers: {},
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header is present but no token", () => {
    const req = {
      headers: {
        authorization: "Bearer",
      },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is invalid", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if token is valid", () => {
    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
      user: undefined,
    } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    const decoded = { userId: 1, email: "test@example.com" };
    vi.mocked(jwt.verify).mockReturnValue(decoded as any);

    authenticateToken(req, res, next);

    expect((req as any).user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
