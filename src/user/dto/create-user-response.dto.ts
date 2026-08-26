import z from 'zod';
import { UserResponseSchema } from './user-response.dto';
import { AuthTokensSchema } from '@token/dto/token.dto';
import { createZodDto } from 'nestjs-zod';

export const CreateUserResponseSchema = z
  .object({
    user: UserResponseSchema,
  })
  .extend(AuthTokensSchema.shape);

export class CreateUserResponseDto extends createZodDto(
  CreateUserResponseSchema,
) {}
