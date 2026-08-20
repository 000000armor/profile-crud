import { Body, Controller, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthTokensDto } from './dto/auth.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ZodSerializerDto(AuthTokensDto)
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }
}
