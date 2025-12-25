import { Module } from '@nestjs/common';
import { UserController } from './Api/user.controller';
import { AuthController } from './Api/auth.controller';
import { SecurityController } from './Api/security.controller';
import { AuthService } from './Application/auth.service';
import { UserService } from './Application/user.service';
import { ConfirmPasswordRecoveryUseCase } from './Application/UseCases/Auth/confirm-password-recovery.usecase';
import { LoginUseCase } from './Application/UseCases/Auth/login.usecase';
import { LogoutUseCase } from './Application/UseCases/Auth/logout.usecase';
import { PasswordRecoveryUseCase } from './Application/UseCases/Auth/password-recovery.usecase';
import { RefreshTokenUseCase } from './Application/UseCases/Auth/refresh-token.usecase';
import { RegistrationUseCase } from './Application/UseCases/Auth/registration.usecase';
import { ResendEmailConfirmUseCase } from './Application/UseCases/Auth/resend-email-confirm.usecase';
import { DeleteSessionUseCase } from './Application/UseCases/Security/delete-session.usecase';
import { UserSqlQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/user-sql.query-repository';
import { SessionSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/session-sql.repository';
import { UserSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/user-sql.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { EmailConfirmInfoTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/emailConfirmInfo.typeorm-entity';
import { PasswordRecoveryInfoTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/passwordRecoveryInfo.typeorm-entity';
import { SessionTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/session.typeorm-entity';
import { NotificationModule } from '../Notifications/notification.module';
import { BasicStrategy } from './Application/Strategies/basic.strategy';
import { LocalStrategy } from './Application/Strategies/local.strategy';
import { JwtStrategy } from './Application/Strategies/jwt.strategy';
import { JwtRefreshStrategy } from './Application/Strategies/refresh.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthExternalService } from './Application/auth.external-service';

const useCases = [
  ConfirmPasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
  LoginUseCase,
  LogoutUseCase,
  PasswordRecoveryUseCase,
  RefreshTokenUseCase,
  RegistrationUseCase,
  ResendEmailConfirmUseCase,
  DeleteSessionUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserTypeormEntity,
      EmailConfirmInfoTypeormEntity,
      PasswordRecoveryInfoTypeormEntity,
      SessionTypeormEntity,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    NotificationModule,
  ],
  controllers: [UserController, AuthController, SecurityController],
  providers: [
    AuthService,
    UserService,
    UserSqlQueryRepository,
    UserSqlRepository,
    SessionSqlRepository,
    ...useCases,
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    AuthExternalService,
  ],
  exports: [AuthExternalService],
})
export class UserAccountsModule {}
