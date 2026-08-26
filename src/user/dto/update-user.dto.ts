import { CreateUserSchema } from './create-user.dto';
import { createZodDto } from 'nestjs-zod';

export const UpdateUserSchema = CreateUserSchema.partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
