import { Role } from '../../generated/prisma/enums';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export interface UserPayload {
  id: number;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'Pomidor',
    });
  }

  async validate(payload: JwtPayload): Promise<UserPayload> {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
