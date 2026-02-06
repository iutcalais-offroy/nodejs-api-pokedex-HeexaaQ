import {Response, NextFunction} from "express";
import {Request} from "express";
import jwt from "jsonwebtoken";
import {env} from "../env";

export const authenticateToken = (req: Request<any, any, any>, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({error: "No token provided"});
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {userId: number; email: string};
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({error: "Invalid or expired token"});
    }
};