import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../generated/client';
import * as bcrypt from 'bcrypt';

export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // 1. 유저 정보 조회용
    private jwtService: JwtService, // 2. 토큰 발급용
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersService.findOne(email); // 이메일로 찾고

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // 보안상 비밀번호는 빼고 리턴(스프레드 연산자)
      return result;
    }
    return null; // 실패 시 null
  }
  // 2. 로그인 (토큰 발급)
  async login(user: UserWithoutPassword) {
    const payload = {
      username: user.nickname,
      sub: user.id,
      email: user.email,
    }; // 토큰에 담을 정보
    return {
      access_token: await this.jwtService.signAsync(payload), // 객체 내부는 Nest에서 Promise를 자동으로 처리 못함 -> await 사용
    };
  }
}
