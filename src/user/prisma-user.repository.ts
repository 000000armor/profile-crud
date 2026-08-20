import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from '@generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  create(data: CreateUserDto & { id: string }): Promise<User> {
    return this.prisma.user.create({ data });
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
