import {
  Controller,
  Get,
  HttpCode,
  UseGuards,
  Request,
  Inject,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtRefreshGuard } from './Guards/Jwt/refresh.guard';
import { SessionRepository } from '../Infrastructure/Repositories/session.repository';
import { RefreshTokenPayloadType } from '../Types/Types';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../Application/UseCases/Security/delete-session.usecase';

@Controller('security')
export class SecurityController {
  constructor(
    @Inject(SessionRepository) protected sessionRepository: SessionRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async getDevices(@Request() req: Express.Request) {
    return await this.sessionRepository.findAllMySessions(
      req.user as RefreshTokenPayloadType,
    );
  }

  @Delete('devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteAllSessions(@Request() req: Express.Request) {
    await this.sessionRepository.deleteAllSessions(
      req.user as RefreshTokenPayloadType,
    );
    return;
  }

  @Delete('devices/:deviceId')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteSession(
    @Request() req: Express.Request,
    @Param('deviceId') deviceId: string,
  ) {
    await this.commandBus.execute(
      new DeleteSessionCommand(req.user as RefreshTokenPayloadType, deviceId),
    );
    return;
  }
}
