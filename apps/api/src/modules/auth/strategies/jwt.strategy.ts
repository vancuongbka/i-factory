import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'change_me',
    });
  }

  validate(payload: { sub: string; username: string; fullName: string; role: string; allowedFactories: string[] }): CurrentUserPayload {
    return {
      sub: payload.sub,
      username: payload.username,
      fullName: payload.fullName,
      role: payload.role,
      allowedFactories: payload.allowedFactories,
    };
  }
}
