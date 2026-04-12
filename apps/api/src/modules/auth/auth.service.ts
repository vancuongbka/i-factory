import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '@i-factory/api-types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      allowedFactories: user.allowedFactories,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      expiresIn: 900,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; username: string; fullName: string; role: string; allowedFactories: string[] }>(token);
      const newPayload = {
        sub: payload.sub,
        username: payload.username,
        fullName: payload.fullName,
        role: payload.role,
        allowedFactories: payload.allowedFactories,
      };
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
        expiresIn: 900,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
