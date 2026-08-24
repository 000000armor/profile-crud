import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY, UserRepository } from '@user/user.repository';
import { JWT_REFRESH_SECRET } from '@common/constants';
import { LoginDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { TokenService } from '@token/token.service';
import { AuthTokensDto } from '@token/dto/token.dto';

type JwtPayload = {
  sub: string;
  login: string;
};

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    @Inject(USER_REPOSITORY) private user: UserRepository,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.user.findByLogin({ login: dto.login });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.tokenService.issueTokens({ sub: user.id, login: user.login });
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const refreshSecret = this.config.getOrThrow<string>(JWT_REFRESH_SECRET);

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.user.findById({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.tokenService.issueTokens({
      sub: user.id,
      login: user.login,
    });
  }
}
