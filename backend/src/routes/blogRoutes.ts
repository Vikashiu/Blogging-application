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
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const authorId = req.id;
    const blogs = await prisma.blog.findMany({
      where: { authorId: authorId },
      orderBy: { createdAt: "desc" }
    });

    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch blogs" });
  }
});

router.patch('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;
    // @ts-ignore
    const authorId = req.id;

    console.log("User attempting update:", authorId); // Check this log
    console.log("Blog ID to update:", id);

    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) return res.status(404).json({ error: "Blog not found" });
    
    // Check comparison
    if (blog.authorId !== authorId) {
        console.log("Auth Failed. Blog Author:", blog.authorId, "Req User:", authorId);
        return res.status(403).json({ error: "Not allowed" });
    }

    const updated = await prisma.blog.update({
      where: { id },
      data: { title, content },
    });

    res.json({ updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error updating blog" });
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
        published: true, 
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

router.get("/search", async (req, res) => {
  let { q, tag, sort } = req.query;

  q = typeof q === "string" ? q : "";
  const tagId = typeof tag === "string" ? tag : null;
  sort = typeof sort === "string" ? sort : "latest";

  const whereConditions: any = {
    AND: [
      q
        ? {
            title: {
              contains: q,
              mode: "insensitive",
            },
          }
        : {},

      tagId
        ? {
            tags: {
              some: { id: tagId },
            },
          }
        : {},

      { published: true },
    ],
  };

  // FIXED ORDER BY
  const orderBy =
    sort === "views"
      ? ({ views: "desc" } as const)
      : sort === "likes"
      ? ({ likes: "desc" } as const)
      : ({ createdAt: "desc" } as const);

  const blogs = await prisma.blog.findMany({
    where: whereConditions,
    orderBy,
  });

  res.json(blogs);
});



router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.id;

    // 1️⃣ Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // 2️⃣ Check if user is authorized
    if (blog.authorId !== userId) {
      return res.status(403).json({ error: "Not allowed to delete this blog" });
    }

    // 3️⃣ Delete blog
    await prisma.blog.delete({
      where: { id },
    });

    res.json({ success: true, message: "Blog deleted successfully" });

  } catch (err) {
    console.log("Delete error:", err);
    res.status(500).json({ error: "Error deleting blog" });
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

export default router;
