import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Ip,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserQueryRep } from '../Infrastructure/Query-repositories/user.query-repository';
import { AuthService } from '../Application/auth.service';
import {
  ConfirmEmailInputDTO,
  LoginInputDTO,
  newPasswordInputDTO,
  PasswordRecoveryInputDTO,
  RegistrationInputDTO,
  ResendConfirmCodeInputDTO,
} from './Input-dto/auth.input-dto';
import { JwtGuard } from './Guards/Jwt/jwt.guard';
import type { FastifyReply } from 'fastify';
import { LocalGuard } from './Guards/Local/local.guard';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
  TokenPairType,
} from '../Types/Types';
import { LoginCommand } from '../Application/UseCases/Auth/login.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshGuard } from './Guards/Jwt/refresh.guard';
import { RefreshTokenCommand } from '../Application/UseCases/Auth/refresh-token.usecase';
import { LogoutCommand } from '../Application/UseCases/Auth/logout.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UserQueryRep) protected usersQueryRep: UserQueryRep,
    @Inject(AuthService) protected authService: AuthService,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registration(@Body() reqBody: RegistrationInputDTO) {
    await this.authService.registration(reqBody);
    return;
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async confirmEmail(@Body() reqBody: ConfirmEmailInputDTO): Promise<void> {
    await this.authService.confirmEmail(reqBody.code);
    return;
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async resendEmail(@Body() reqBody: ResendConfirmCodeInputDTO): Promise<void> {
    await this.authService.resendConfirmCode(reqBody.email);
    return;
  }

  @Post('login')
  @UseGuards(ThrottlerGuard, LocalGuard)
  @HttpCode(200)
  async login(
    @Request() nestReq: Express.Request,
    @Request() req: Request,
    @Ip() ip: string,
    @Body() loginInputData: LoginInputDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const deviceName: string = req.headers['user-agent'] as string;
    const tokenPair: TokenPairType = await this.commandBus.execute(
      new LoginCommand(nestReq.user as AccessTokenPayloadType, ip, deviceName),
    );
    response.setCookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokenPair.accessToken };
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() reqBody: PasswordRecoveryInputDTO) {
    await this.authService.passwordRecovery(reqBody.email);
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async newPassword(@Body() reqBody: newPasswordInputDTO) {
    await this.authService.setNewPassword(reqBody);
    return;
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getMe(@Request() req: Express.Request) {
    return await this.usersQueryRep.getMyInfo(
      req.user as AccessTokenPayloadType,
    );
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Request() req: Express.Request,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const tokenPair: TokenPairType = await this.commandBus.execute(
      new RefreshTokenCommand(req.user as RefreshTokenPayloadType),
    );
    response.setCookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokenPair.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@Request() req: Express.Request) {
    await this.commandBus.execute(
      new LogoutCommand(req.user as RefreshTokenPayloadType),
    );
  }
}
