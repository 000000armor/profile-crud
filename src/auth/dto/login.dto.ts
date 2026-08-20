import z from 'zod';

export const LoginSchema = z.object({
  login: z.string().min(6),
  password: z.string().min(8),
});

export type LoginDto = z.infer<typeof LoginSchema>;
