import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@generated/prisma/client';
import {
  UpdateUserData,
  USER_REPOSITORY,
  UserAlreadyExistsError,
  UserNotFoundError,
} from './user.repository';
import { type IdGenerator, UUID_GENERATOR } from '@common/id-generator';
import { type UserRepository } from './user.repository';
import bcrypt from 'bcrypt';
import { TokenService } from '@token/token.service';
import { AuthTokensDto } from '@token/dto/token.dto';
import { FindUserQueryDto } from './dto/find-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type SafeUser = Omit<User, 'password' | 'deletedAt'>;

export type CreateUserResult = {
  user: SafeUser;
  tokens: AuthTokensDto;
};

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private repo: UserRepository,
    @Inject(UUID_GENERATOR) private uuidGenerator: IdGenerator,
    private tokenService: TokenService,
  ) {}
  async createUser(dto: CreateUserDto): Promise<CreateUserResult> {
    try {
      const id = this.uuidGenerator.generate();
      const { password, ...safeUser } = dto;
      const passwordHash = await bcrypt.hash(password, 10);

      await this.repo.create({
        id,
        password: passwordHash,
        ...safeUser,
      });

      const user = {
        id,
        ...safeUser,
      };

      const tokens = await this.tokenService.issueTokens({
        login: dto.login,
        sub: id,
      });

      return {
        user,
        tokens,
      };
    } catch (e) {
      if (e instanceof UserAlreadyExistsError) {
        throw new ConflictException();
      } else {
        throw e;
      }
    }
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.repo.findById({ id });
    if (!user) {
      throw new NotFoundException('User is not exist');
    }
    const { password: _password, deletedAt: _deletedAt, ...safeUser } = user;

    return safeUser;
  }

  async findUsers({ page, limit, login }: FindUserQueryDto) {
    const skip = (page - 1) * limit;

    const { users, total } = await this.repo.findUsers({
      skip,
      take: limit,
      login,
    });

    const safeUsers: SafeUser[] = users.map(
      ({ password: _password, deletedAt: _deletedAt, ...safeUser }) => safeUser,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      users: safeUsers,
      pagination: { page, limit, total, totalPages },
    };
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.repo.softDelete(id);

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async updateUser({
    id,
    updateUserDto,
  }: {
    id: string;
    updateUserDto: UpdateUserDto;
  }): Promise<SafeUser> {
    const { password, ...restUser } = updateUserDto;

    const updateUserData: UpdateUserData = password
      ? {
          ...restUser,
          password: await bcrypt.hash(password, 10),
        }
      : restUser;

    try {
      const user = await this.repo.updateUser({
        id,
        updateUserData,
      });

      const { password: _password, deletedAt: _deletedAt, ...safeUser } = user;

      return safeUser;
    } catch (e) {
      if (e instanceof UserAlreadyExistsError) {
        throw new ConflictException('Login or email already exists');
      }
      if (e instanceof UserNotFoundError) {
        throw new NotFoundException('User not found');
      }

      throw e;
    }
  }
}
