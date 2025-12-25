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
import { AuthService } from '../Application/auth.service';
import {
  ConfirmEmailInputDTO,
  LoginInputDTO,
  newPasswordInputDTO,
  PasswordRecoveryInputDTO,
  RegistrationInputDTO,
  ResendConfirmCodeInputDTO,
} from './InputDTOValidators/auth.input-dto.validator';
import { JwtGuard } from '../../Common/Guards/jwt.guard';
import { LocalGuard } from '../../Common/Guards/local.guard';
import { LoginCommand } from '../Application/UseCases/Auth/login.usecase';
import { CommandBus } from '@nestjs/cqrs';
import { JwtRefreshGuard } from '../../Common/Guards/refresh.guard';
import { RefreshTokenCommand } from '../Application/UseCases/Auth/refresh-token.usecase';
import { LogoutCommand } from '../Application/UseCases/Auth/logout.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegistrationCommand } from '../Application/UseCases/Auth/registration.usecase';
import { ConfirmRegistrationCommand } from '../Application/UseCases/Auth/confirm-registration.usecase';
import { ResendEmailConfirmCommand } from '../Application/UseCases/Auth/resend-email-confirm.usecase';
import { PasswordRecoveryCommand } from '../Application/UseCases/Auth/password-recovery.usecase';
import { ConfirmPasswordRecoveryCommand } from '../Application/UseCases/Auth/confirm-password-recovery.usecase';
import { UserSqlQueryRepository } from '../Infrastructure/Data-access/Sql/Query-repositories/user-sql.query-repository';
import type { Response } from 'express';
import { MyInfoType } from './Types/user-account.view-model.types';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../../Common/Types/auth-payloads.types';
import { TokenPairType } from '../Application/Types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UserSqlQueryRepository)
    protected usersQueryRep: UserSqlQueryRepository,
    @Inject(AuthService) protected authService: AuthService,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registration(@Body() reqBody: RegistrationInputDTO) {
    await this.commandBus.execute(new RegistrationCommand(reqBody));
    return;
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async confirmEmail(@Body() reqBody: ConfirmEmailInputDTO): Promise<void> {
    await this.commandBus.execute(new ConfirmRegistrationCommand(reqBody));
    return;
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async resendEmail(@Body() reqBody: ResendConfirmCodeInputDTO): Promise<void> {
    await this.commandBus.execute(new ResendEmailConfirmCommand(reqBody));
    return;
  }

  @Post('login')
  @UseGuards(ThrottlerGuard, LocalGuard)
  @HttpCode(200)
  async login(
    @Request() req: Express.Request,
    @Request() nestReq: Request,
    @Ip() ip: string,
    @Body() loginInputData: LoginInputDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const deviceName: string = nestReq.headers['user-agent'] as string;
    const tokenPair: TokenPairType = await this.commandBus.execute(
      new LoginCommand(req.user as AccessTokenPayloadType, ip, deviceName),
    );
    response.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokenPair.accessToken };
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async passwordRecovery(@Body() reqBody: PasswordRecoveryInputDTO) {
    await this.commandBus.execute(new PasswordRecoveryCommand(reqBody));
    return;
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async newPassword(@Body() reqBody: newPasswordInputDTO) {
    await this.commandBus.execute(new ConfirmPasswordRecoveryCommand(reqBody));
    return;
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async getMe(@Request() req: Express.Request): Promise<MyInfoType | null> {
    return await this.usersQueryRep.getMyInfo(
      req.user as AccessTokenPayloadType,
    );
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Request() req: Express.Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const tokenPair: TokenPairType = await this.commandBus.execute(
      new RefreshTokenCommand(req.user as RefreshTokenPayloadType),
    );
    response.cookie('refreshToken', tokenPair.refreshToken, {
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
