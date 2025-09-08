"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usertypes_1 = require("../types/usertypes");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const authMiddleware_1 = require("../authMiddleware");
dotenv_1.default.config();
const prismaClient = new client_1.PrismaClient();
const userRouter = (0, express_1.Router)();
userRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = usertypes_1.signupInput.safeParse(body);
    // if (!parsedData.success) {
    //     return res.status(411).json({ message: "Incorrect inputs" });
    // }
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsedData.error.flatten().fieldErrors,
        });
    }
    const existingUser = yield prismaClient.user.findUnique({
        where: { email: parsedData.data.username }
    });
    if (existingUser) {
        return res.status(403).json({ message: "User already exists" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(parsedData.data.password, 10);
    const user = yield prismaClient.user.create({
        data: {
            email: parsedData.data.username,
            password: hashedPassword,
            name: parsedData.data.name,
        }
    });
    const userId = user.id;
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_PASSWORD, {
        expiresIn: '7d', // Optional but recommended
    });
    res.json({ token });
}));
userRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = usertypes_1.signinInput.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }
    const user = yield prismaClient.user.findUnique({
        where: { email: parsedData.data.username },
        select: { id: true, password: true, email: true, name: true }
    });
    if (!user) {
        return res.status(403).json({ message: "Sorry, credentials are incorrect" });
    }
    const isPasswordValid = yield bcrypt_1.default.compare(parsedData.data.password, user.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: "Sorry, credentials are incorrect" });
    }
    const userId = user.id;
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_PASSWORD);
    res.json({ token });
}));
userRouter.get('/', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const user = yield prismaClient.user.findFirst({
        where: { id },
        select: {
            name: true,
            email: true
        }
    });
    res.json({ user });
}));
exports.default = userRouter;
