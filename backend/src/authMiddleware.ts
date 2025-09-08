import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authMiddleware(req: any, res: any, next: any) {
    console.log('auth middleware called');
    const authHeader = req.headers.authorization as string;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authorization header missing or malformed" });
        alert('authentication needed');
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_PASSWORD as string);
        console.log('payload');
        console.log(payload)
        //@ts-ignore
        req.id = payload.userId
        next();
    } catch (e) {
        res.status(403).json({
            message: "You are not logged in"
        })
        return;
    }


}
