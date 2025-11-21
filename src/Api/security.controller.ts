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
import { RefreshTokenPayloadType, SessionViewType } from '../Types/Types';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../Application/UseCases/Security/delete-session.usecase';
import { SessionSqlRepository } from '../Infrastructure/Repositories/SQL/session-sql.repository';

@Controller('security')
export class SecurityController {
  constructor(
    @Inject(SessionSqlRepository)
    protected sessionRepository: SessionSqlRepository,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async getDevices(
    @Request() req: Express.Request,
  ): Promise<SessionViewType[] | null> {
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
