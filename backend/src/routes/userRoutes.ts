import { Router } from "express";
import { SigninInput, SignupInput, signinInput, signupInput } from "../types/usertypes";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authMiddleware } from "../authMiddleware";

dotenv.config();
const prismaClient = new PrismaClient();
const userRouter = Router();

userRouter.post('/signup', async (req, res) => {
    const body = req.body;
    const parsedData = signupInput.safeParse(body);

    // if (!parsedData.success) {
    //     return res.status(411).json({ message: "Incorrect inputs" });
    // }
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsedData.error.flatten().fieldErrors,
        });
    }

    const existingUser = await prismaClient.user.findUnique({
        where: { email: parsedData.data.username }
    });

    if (existingUser) {
        return res.status(403).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const user = await prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: hashedPassword,
            name: parsedData.data.name,
        }
    });
    const userId = user.id;

    const token = jwt.sign({ userId }, process.env.JWT_PASSWORD as string, {
        expiresIn: '7d', // Optional but recommended
    });

    res.json({ token });
});

userRouter.post('/signin', async (req, res) => {
    const body = req.body;
    const parsedData = signinInput.safeParse(body);

    if (!parsedData.success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const user = await prismaClient.user.findUnique({
        where: { email: parsedData.data.username },
        select: { id: true, password: true, email: true, name: true }
    });

    if (!user) {
        return res.status(403).json({ message: "Sorry, credentials are incorrect" });
    }

    const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);

    if (!isPasswordValid) {
        return res.status(403).json({ message: "Sorry, credentials are incorrect" });
    }
    const userId = user.id;
    const token = jwt.sign({ userId }, process.env.JWT_PASSWORD as string);

    res.json({ token });
});

userRouter.get('/', authMiddleware, async (req, res) => {
    //@ts-ignore
    const id = req.id;

    const user = await prismaClient.user.findFirst({
        where: { id },
        select: {
            name: true,
            email: true
        }
    });

    res.json({ user });
});

export default userRouter;
