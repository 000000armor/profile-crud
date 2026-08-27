import z from 'zod';
import { UserResponseSchema } from './user-response.dto';
import { createZodDto } from 'nestjs-zod';

export const FindUserResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export class FindUserResponseDto extends createZodDto(FindUserResponseSchema) {}
