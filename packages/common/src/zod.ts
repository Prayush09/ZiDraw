import { z } from 'zod';

export const CreateUserSchema = z.object({
    name: z.string().min(3).max(10),
    password: z.string().min(8).max(16),
    email: z.string().email(),
    photo: z.instanceof(File).refine((file) => ['image/jpeg', 'image/png'].includes(file.type), 'Invalid file type').refine((file) => file.size < 5 * 1024 * 1024, 'File size too large').optional(),
});

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(16)
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(10)
});