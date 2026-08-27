import { Injectable } from '@nestjs/common';
import {
  UserRepository,
  UserAlreadyExistsError,
  UsersParams,
  UserNotFoundError,
  UpdateUserData,
} from './user.repository';
import { Prisma, User } from '@generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@prisma/prisma.service';
import { UserWhereInput } from '@generated/prisma/models';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto & { id: string }): Promise<User> {
    try {
      const result = await this.prisma.user.create({
        data: { ...data, deletedAt: null },
      });
      return result;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new UserAlreadyExistsError();
      }
      throw e;
    }
  }

  async findById({ id }: { id: string }): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByLogin({ login }: { login: string }): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { login, deletedAt: null },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async findUsers({
    skip,
    take,
    login,
  }: UsersParams): Promise<{ users: User[]; total: number }> {
    const where: UserWhereInput = {
      deletedAt: null,
      ...(login
        ? {
            login: {
              contains: login,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { id: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.prisma.user.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }

  async updateUser({
    id,
    updateUserData,
  }: {
    id: string;
    updateUserData: UpdateUserData;
  }): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          ...updateUserData,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new UserAlreadyExistsError();
        }

        if (e.code === 'P2025') {
          throw new UserNotFoundError();
        }
      }

      throw e;
    }
  }
}
