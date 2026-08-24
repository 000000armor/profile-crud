import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthTokensDto } from '@token/dto/token.dto';
import { RefreshDto, RefreshSchema } from '@token/dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ZodSerializerDto(AuthTokensDto)
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ZodSerializerDto(AuthTokensDto)
  async refresh(@Body(new ZodValidationPipe(RefreshSchema)) dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
