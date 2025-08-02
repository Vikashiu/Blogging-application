import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../authMiddleware';
import { createCommentInput, type CreateCommentInput } from '../types/commentTypes';
const router = express.Router();
const prisma = new PrismaClient();

// Get all comments for a specific post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await prisma.comment.findMany({
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment for a post (auth required)
router.post('/', authMiddleware, async (req, res) => {

  try {
    const parsed = createCommentInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error});
    }
    const { content, blogId } = req.body;
    console.log(req.body);
    const postId = blogId
    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
    }
    // @ts-ignore
    const authorId = req.id;
    const newComment = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId
      }
    });
    console.log(newComment)
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

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
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const requesterId = req.id;

    // Fetch the comment first
    const comment = await prisma.comment.findUnique({
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
    await prisma.comment.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


export default router;
