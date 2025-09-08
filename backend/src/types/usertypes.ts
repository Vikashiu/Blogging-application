import z from 'zod';

export const signupInput = z.object({
    username: z.email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    avatar: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupInput>;

export const signinInput = z.object({
    username: z.email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type SigninInput = z.infer<typeof signinInput>;


