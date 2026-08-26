import { JWT_SECRET } from '@common/constants';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { USER_REPOSITORY, UserRepository } from '@user/user.repository';
import { Strategy, ExtractJwt } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  login: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>(JWT_SECRET),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      login: user.login,
    };
  }
}
