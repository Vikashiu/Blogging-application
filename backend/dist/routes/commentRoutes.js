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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../authMiddleware");
const commentTypes_1 = require("../types/commentTypes");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all comments for a specific post
router.get('/post/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const comments = yield prisma.comment.findMany({
            where: { postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(comments);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
}));
// Create a new comment for a post (auth required)
router.post('/', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = commentTypes_1.createCommentInput.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error });
        }
        const { content, blogId } = req.body;
        console.log(req.body);
        const postId = blogId;
        if (!content || !postId) {
            return res.status(400).json({ error: 'Content and postId are required' });
        }
        // @ts-ignore
        const authorId = req.id;
        const newComment = yield prisma.comment.create({
            data: {
                content,
                authorId,
                postId
            }
        });
        console.log(newComment);
        res.status(201).json(newComment);
    }
    catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).json({ error: 'Failed to create comment' });
    }
}));
// Delete a comment (auth required)
// router.delete('/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.comment.delete({
//       where: { id }
//     });
//     res.status(204).end();
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete comment' });
//   }
// });
router.delete('/:id', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // @ts-ignore
        const requesterId = req.id;
        // Fetch the comment first
        const comment = yield prisma.comment.findUnique({
            where: { id },
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        // Check if the requester is the author
        if (comment.authorId !== requesterId) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }
        // Proceed to delete
        yield prisma.comment.delete({
            where: { id },
        });
        res.status(204).end();
    }
    catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
}));
exports.default = router;
