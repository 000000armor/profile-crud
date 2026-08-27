import { AuthTokensDto } from '@token/dto/token.dto';
import { LoginDto } from './dto/login.dto';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  login(data: LoginDto): Promise<AuthTokensDto>;
}
