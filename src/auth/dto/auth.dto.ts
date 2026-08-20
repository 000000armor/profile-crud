import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AuthTokensSchema = z.object({
  acessToken: z.string(),
  refreshToken: z.string(),
});

export class AuthTokensDto extends createZodDto(AuthTokensSchema) {}
