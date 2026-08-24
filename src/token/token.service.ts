import { Injectable } from '@nestjs/common';
import { AuthTokensDto } from './dto/token.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '@common/constants';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async issueTokens(payload: {
    login: string;
    sub: string;
  }): Promise<AuthTokensDto> {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
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
