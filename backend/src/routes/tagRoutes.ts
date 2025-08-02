import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all tags
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: req.params.id },
    });
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// CREATE new tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const newTag = await prisma.tag.create({
      data: { name },
    });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// UPDATE tag by ID
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const updatedTag = await prisma.tag.update({
      where: { id: req.params.id },
      data: { name },
    });
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// DELETE tag by ID
router.delete('/:id', async (req, res) => {
  try {
    await prisma.tag.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
