import { z } from 'zod';

export const CreateUserSchema = z.object({
    name: z.string().min(3).max(10),
    password: z.string().min(8).max(16),
    email: z.string().email(),
});

export const SignInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(16)
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(10)
});