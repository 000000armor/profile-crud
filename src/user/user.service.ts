import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@generated/prisma/client';
import { USER_REPOSITORY } from './user.repository';
import { type IdGenerator, UUID_GENERATOR } from 'src/common/id-generator';
import { type UserRepository } from './user.repository';
import bcrypt from 'bcrypt';

export type CreateUserResult =
  { ok: true; user: User } | { ok: false; error: 'Creation Error' };

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private repo: UserRepository,
    @Inject(UUID_GENERATOR) private uuidGenerator: IdGenerator,
  ) {}
  async createUser(dto: CreateUserDto): Promise<CreateUserResult> {
    try {
      const id = this.uuidGenerator.generate();
      const { password, ...restUser } = dto;
      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.repo.create({
        id,
        password: passwordHash,
        ...restUser,
      });

      return {
        ok: true,
        user,
      };
    } catch {
      return {
        ok: false,
        error: 'Creation Error',
      };
    }
  }
}
