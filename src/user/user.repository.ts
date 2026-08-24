import { User } from '@generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export class UserAlreadyExistsError extends Error {}

export interface UserRepository {
  create(data: CreateUserDto & { id: string }): Promise<User>;
  findById({ id }: { id: string }): Promise<User | null>;
  findByLogin({ login }: { login: string }): Promise<User | null>;
}
