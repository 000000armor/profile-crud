import { z } from 'zod';
import { CreateUserSchema } from './create-user.dto';

export const UpdateUserSchema = CreateUserSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
