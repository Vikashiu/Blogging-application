import z from 'zod';

export const createBlogInput = z.object({
    title: z.string(),
    content: z.any,
    subtitle: z.string().optional(),
    coverImage: z.string().optional(),
    tags: z.array(z.string()).optional()

})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.any(),
    id: z.number()
})
export type UpdateBlogInput = z.infer<typeof updateBlogInput>
