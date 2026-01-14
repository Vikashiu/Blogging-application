// backend/index.js
import userRouter from './routes/userRoutes';
import blogRouter from './routes/blogRoutes';
import commentRouter from './routes/commentRoutes';
import giminiRouter from './routes/giminiRoute'; // Assuming you have a geminiRouter for handling Gemini API requests
import tagRouter from './routes/tagRoutes';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
// import aiRoutes from './routes/aiRoutes'
dotenv.config();


const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/gemini', giminiRouter); // Assuming you have a geminiRouter for handling Gemini API requests
// app.use('/api/v1/ai',aiRoutes);
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong' });
});


const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not set
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
