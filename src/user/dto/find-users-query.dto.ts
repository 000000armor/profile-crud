import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FindUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  login: z.string().trim().min(1).optional(),
});

export class FindUserQueryDto extends createZodDto(FindUserQuerySchema) {}
