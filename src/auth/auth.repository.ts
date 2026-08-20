import { AuthTokensDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface AuthRepository {
  login(data: LoginDto): Promise<AuthTokensDto>;
}
