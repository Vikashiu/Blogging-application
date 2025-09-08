import z from 'zod';

// Create Comment Schema
export const createCommentInput = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  blogId: z.string().uuid("Invalid blog ID format"),
});

export type CreateCommentInput = z.infer<typeof createCommentInput>;

// Optionally, Update Comment Schema (if you allow editing)
export const updateCommentInput = z.object({
  id: z.string().uuid("Invalid comment ID"),
  content: z.string().min(1, "Comment cannot be empty"),
});

export type UpdateCommentInput = z.infer<typeof updateCommentInput>;