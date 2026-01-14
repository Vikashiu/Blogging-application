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
userRouter.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const id = req.id;
        const user = yield prismaClient.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                twitter: true,
                linkedin: true,
                github: true,
                notifyEmail: true,
                notifyPush: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    }
    catch (err) {
        console.log("User load error:", err);
        res.status(500).json({ message: "Failed to load profile" });
    }
}));
userRouter.patch("/me", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const userId = req.id;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const { name, bio, avatar, twitter, linkedin, github, notifyEmail, notifyPush, currentPassword, newPassword, } = req.body;
        // Build update object
        const data = {};
        if (typeof name === "string")
            data.name = name;
        if (typeof bio === "string")
            data.bio = bio;
        if (typeof avatar === "string")
            data.avatar = avatar;
        if (typeof twitter === "string")
            data.twitter = twitter;
        if (typeof linkedin === "string")
            data.linkedin = linkedin;
        if (typeof github === "string")
            data.github = github;
        if (typeof notifyEmail === "boolean")
            data.notifyEmail = notifyEmail;
        if (typeof notifyPush === "boolean")
            data.notifyPush = notifyPush;
        // If user wants to change password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password required to change password" });
            }
            const user = yield prismaClient.user.findUnique({ where: { id: userId }, select: { password: true } });
            if (!user)
                return res.status(404).json({ message: "User not found" });
            const valid = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!valid)
                return res.status(403).json({ message: "Current password incorrect" });
            const hashed = yield bcrypt_1.default.hash(newPassword, 10);
            data.password = hashed;
        }
        const updated = yield prismaClient.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                twitter: true,
                linkedin: true,
                github: true,
                notifyEmail: true,
                notifyPush: true
            }
        });
        res.json({ user: updated });
    }
    catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
}));
// Important:
// GET public profile by ID
userRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield prismaClient.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                bio: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                twitter: true,
                github: true,
                linkedin: true,
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Fetch user's published blogs
        const blogs = yield prismaClient.blog.findMany({
            where: {
                authorId: id,
                published: true
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ user, blogs });
    }
    catch (err) {
        console.log("Profile fetch error:", err);
        res.status(500).json({ message: "Failed to load profile" });
    }
}));
exports.default = userRouter;
