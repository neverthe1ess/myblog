import { Controller, Body, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body) {
        const user = await this.authService.validateUser(body.email, body.password);

        if (!user) {
            throw new UnauthorizedException('이메일이나 비밀번호를 확인해주세요.');
        }

        return this.authService.login(user);
    }
}
