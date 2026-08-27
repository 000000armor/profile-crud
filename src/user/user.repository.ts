import { User } from '@generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export class UserAlreadyExistsError extends Error {}

export class UserNotFoundError extends Error {}

export type UsersParams = {
  skip: number;
  take: number;
  login?: string;
};

export type UpdateUserData = Partial<Omit<User, 'id' | 'deletedAt'>>;

export interface UserRepository {
  create(data: CreateUserDto & { id: string }): Promise<User>;
  findById({ id }: { id: string }): Promise<User | null>;
  findByLogin({ login }: { login: string }): Promise<User | null>;
  findUsers(params: UsersParams): Promise<{
    users: User[];
    total: number;
  }>;
  softDelete(id: string): Promise<boolean>;
  updateUser({
    id,
    updateUserData,
  }: {
    id: string;
    updateUserData: UpdateUserData;
  }): Promise<User>;
}
