import { UserResponseSchema } from './user-response.dto';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserResponseDto extends createZodDto(UserResponseSchema) {}
