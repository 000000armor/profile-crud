import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokensDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY, UserRepository } from '@user/user.repository';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '@common/constants';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';

type JwtPayload = {
  sub: string;
  login: string;
};

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    @Inject(USER_REPOSITORY) private user: UserRepository,
  ) {}

  async login(dto: LoginDto) {
    try {
      const user = await this.user.findByLogin({ login: dto.login });

      if (!user) {
        throw Error();
      }

      const ok = await bcrypt.compare(dto.password, user.password);

      if (!ok) {
        throw Error();
      }

      return this.issueToken({ sub: user.id, login: user.login });
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.config.get<string>(JWT_REFRESH_SECRET),
        },
      );

      const user = await this.user.findById({ id: payload.sub });

      if (!user) {
        throw Error();
      }

      return this.issueToken(payload);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async issueToken(payload: {
    login: string;
    sub: string;
  }): Promise<AuthTokensDto> {
    return {
      acessToken: await this.jwtService.signAsync(payload, {
        secret: this.config.get<string>(JWT_SECRET),
        expiresIn: '15m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.config.get<string>(JWT_REFRESH_SECRET),
        expiresIn: '7d',
      }),
    };
  }
}
