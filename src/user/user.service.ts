import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@generated/prisma/client';
import { USER_REPOSITORY, UserAlreadyExistsError } from './user.repository';
import { type IdGenerator, UUID_GENERATOR } from 'src/common/id-generator';
import { type UserRepository } from './user.repository';
import bcrypt from 'bcrypt';
import { TokenService } from '@token/token.service';
import { AuthTokensDto } from '@token/dto/token.dto';

type SafeUser = Omit<User, 'password'>;

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
    const { password: _, ...safeUser } = user;

    return safeUser;
  }
}
