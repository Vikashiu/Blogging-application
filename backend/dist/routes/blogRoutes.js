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
const blogtypes_1 = require("../types/blogtypes");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all blogs
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching all blogs');
        const blogs = yield prisma.blog.findMany({
            include: { author: true, tags: true },
        });
        res.json(blogs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
}));
// Get blog by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield prisma.blog.findUnique({
            where: { id: req.params.id },
            include: { author: true, tags: true },
        });
        if (!blog)
            return res.status(404).json({ error: 'Blog not found' });
        res.json(blog);
    }
    catch (error) {
        console.log('Error fetching blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
}));
// Create new blog (auth required)
router.post('/', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Create blog request body:', req.body);
        console.log('Auth header:', req.headers.authorization);
        const parsed = blogtypes_1.createBlogInput.safeParse(req.body);
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
        const newBlog = yield prisma.blog.create({
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
    }
    catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({
            error: 'Failed to create blog',
            details: error.message || 'Unknown error'
        });
    }
}));
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
exports.default = router;
