import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserQueryRep } from '../Infrastructure/Query-repositories/user.query-repository';
import { AuthService } from '../Application/auth.service';
import { ObjectId } from 'mongodb';
import {
  ConfirmEmailInputDTO,
  JwtPayloadDTO,
  LoginInputDTO,
  newPasswordInputDTO,
  PasswordRecoveryInputDTO,
  RegistrationInputDTO,
  ResendConfirmCodeInputDTO,
} from './Input-dto/auth.input-dto';
import { JwtGuard } from './Guards/Jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UserQueryRep) protected usersQueryRep: UserQueryRep,
    @Inject(AuthService) protected authService: AuthService,
  ) {}

  @Post('registration')
  @HttpCode(204)
  async registration(@Body() reqBody: RegistrationInputDTO) {
    await this.authService.registration(reqBody);
    return;
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmEmail(@Body() reqBody: ConfirmEmailInputDTO): Promise<void> {
    await this.authService.confirmEmail(reqBody.code);
    return;
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() reqBody: ResendConfirmCodeInputDTO): Promise<void> {
    await this.authService.resendConfirmCode(reqBody.email);
    return;
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginInputData: LoginInputDTO) {
    const user: JwtPayloadDTO | null = await this.authService.validateUser(
      loginInputData.loginOrEmail,
      loginInputData.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return { accessToken: this.authService.login(user) };
  }

  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() reqBody: PasswordRecoveryInputDTO) {
    await this.authService.passwordRecovery(reqBody.email);
  }

  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() reqBody: newPasswordInputDTO) {
    await this.authService.setNewPassword(reqBody);
    return;
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getMe(@Request() req: Express.Request) {
    return await this.usersQueryRep.getMyInfo(req.user as JwtPayloadDTO);
  }
}
