import { Injectable } from '@nestjs/common';
import { UserRepository, UserAlreadyExistsError } from './user.repository';
import { Prisma, User } from '@generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto & { id: string }): Promise<User> {
    try {
      const result = await this.prisma.user.create({ data });
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
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      return null;
    }

    return user;
  }

  async findByLogin({ login }: { login: string }): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { login } });

    if (!user) {
      return null;
    }

    return user;
  }
}
