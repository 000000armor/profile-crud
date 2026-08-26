import z from 'zod';
import { CreateUserSchema } from './create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const UserResponseSchema = CreateUserSchema.omit({
  password: true,
}).extend({
  id: z.uuid(),
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
