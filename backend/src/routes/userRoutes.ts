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

userRouter.get("/", authMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const id = req.id;

    const user = await prismaClient.user.findUnique({
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
  } catch (err) {
    console.log("User load error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

userRouter.patch("/me", authMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const userId: string = req.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const {
      name,
      bio,
      avatar,
      twitter,
      linkedin,
      github,
      notifyEmail,
      notifyPush,
      currentPassword,
      newPassword,
    } = req.body;

    // Build update object
    const data: any = {};
    if (typeof name === "string") data.name = name;
    if (typeof bio === "string") data.bio = bio;
    if (typeof avatar === "string") data.avatar = avatar;
    if (typeof twitter === "string") data.twitter = twitter;
    if (typeof linkedin === "string") data.linkedin = linkedin;
    if (typeof github === "string") data.github = github;
    if (typeof notifyEmail === "boolean") data.notifyEmail = notifyEmail;
    if (typeof notifyPush === "boolean") data.notifyPush = notifyPush;

    // If user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password required to change password" });
      }

      const user = await prismaClient.user.findUnique({ where: { id: userId }, select: { password: true }});
      if (!user) return res.status(404).json({ message: "User not found" });

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(403).json({ message: "Current password incorrect" });

      const hashed = await bcrypt.hash(newPassword, 10);
      data.password = hashed;
    }

    const updated = await prismaClient.user.update({
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
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});
// Important:
// GET public profile by ID
userRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prismaClient.user.findUnique({
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
    const blogs = await prismaClient.blog.findMany({
      where: {
        authorId: id,
        published: true
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ user, blogs });

  } catch (err) {
    console.log("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

export default userRouter;
