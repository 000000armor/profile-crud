import { JWT_SECRET } from '@common/constants';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  login: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>(JWT_SECRET),
    });
  }

  validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      login: payload.login,
    };
  }
}
