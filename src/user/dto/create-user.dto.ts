import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.email(),
  age: z.int().positive(),
  description: z.string().max(1000),
  password: z.string().min(8),
  login: z.string().min(6),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
