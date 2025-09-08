import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../authMiddleware';
import { createBlogInput } from '../types/blogtypes';
const router = express.Router();
const prisma = new PrismaClient();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all blogs');
    const blogs = await prisma.blog.findMany({
      include: { author: true, tags: true },
    });
    res.json(blogs);
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id },
      include: { author: true, tags: true },
    });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    console.log('Error fetching blog:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Create new blog (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Create blog request body:', req.body);
    console.log('Auth header:', req.headers.authorization);
    
    const parsed = createBlogInput.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues,
      });
    }
    
    // @ts-ignore
    const authorId = req.id;
    console.log('Author ID:', authorId);
    
    if (!authorId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { title, content, tags } = req.body;
 
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        coverimage: req.body.coverimage,
        author: {
          connect: {
            id: authorId
          }
        },
        // tags: {
        //   connect: tags.map((tagName: string) => ({
        //     name: tagName,
        //   })),
        // }
      },
    });

    console.log('Blog created successfully:', newBlog);
    res.status(201).json({ newBlog });

  } catch (error: any) {
    console.error('Create blog error:', error);
    res.status(500).json({ 
      error: 'Failed to create blog',
      details: error.message || 'Unknown error'
    });
  }
});

// router.post('/create',(req, res) => {
//   console.log('Create blog request body:');
// }
// )

// router.get('/search', async (req, res) => {
//   try {
//     const { q } = req.query;
//     const blogs = await prisma.blog.findMany({
//       where: {
//         OR: [
//           { title: { contains: q as string, mode: 'insensitive' } },
//           // { summary: { contains: q as string, mode: 'insensitive' } },
//         ],
//       },
//       include: {
//         author: {
//           select: {
//             name: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });
//     res.json(blogs);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to search blogs' });
//   }
// });
export default router;
