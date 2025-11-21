import { Module } from '@nestjs/common';
import { AppController } from './Api/app.controller';
import { AppService } from './Application/app.service';
import { BlogController } from './Api/blog.contoller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './Application/post.service';
import { PostController } from './Api/post.controller';
import { CommentQueryRep } from './Infrastructure/Query-repositories/comment.query-repository';
import { Comment, CommentSchema } from './Domain/comment.schema';
import { TestingController } from './Api/testing.controller';
import { UserService } from './Application/user.service';
import { UserController } from './Api/user.controller';
import dotenv from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './Infrastructure/MailService/email.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './Api/Guards/Local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './Application/auth.service';
import { AuthController } from './Api/auth.controller';
import { JwtStrategy } from './Api/Guards/Jwt/jwt.strategy';
import { BasicStrategy } from './Api/Guards/Basic/basic.strategy';
import { CommentRepository } from './Infrastructure/Repositories/comment.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginUseCase } from './Application/UseCases/Auth/login.usecase';
import { JwtRefreshStrategy } from './Api/Guards/Jwt/refresh.strategy';
import { RefreshTokenUseCase } from './Application/UseCases/Auth/refresh-token.usecase';
import { LogoutUseCase } from './Application/UseCases/Auth/logout.usecase';
import { DeleteSessionUseCase } from './Application/UseCases/Security/delete-session.usecase';
import { SecurityController } from './Api/security.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationUseCase } from './Application/UseCases/Auth/registration.usecase';
import { ConfirmRegistrationUseCase } from './Application/UseCases/Auth/confirm-registration.usecase';
import { ResendEmailConfirmUseCase } from './Application/UseCases/Auth/resend-email-confirm.usecase';
import { PasswordRecoveryUseCase } from './Application/UseCases/Auth/password-recovery.usecase';
import { ConfirmPasswordRecoveryUseCase } from './Application/UseCases/Auth/confirm-password-recovery.usecase';
import { UserSqlRepository } from './Infrastructure/Repositories/SQL/user-sql.repository';
import { UserSqlQueryRepository } from './Infrastructure/Query-repositories/SQL/user-sql.query-repository';
import { SessionSqlRepository } from './Infrastructure/Repositories/SQL/session-sql.repository';
import { BlogSqlQueryRepository } from './Infrastructure/Query-repositories/SQL/blog-sql.query-repository';
import { PostSqlQueryRepository } from './Infrastructure/Query-repositories/SQL/post-sql.query-repository';
import { BlogSqlRepository } from './Infrastructure/Repositories/SQL/blog-sql.repository';
import { CreateBlogUseCase } from './Application/UseCases/Blog/create-blog.usecase';
import { UpdateBlogUseCase } from './Application/UseCases/Blog/update-blog.usecase';
import { DeleteBlogUseCase } from './Application/UseCases/Blog/delete-blog.usecase';
import { PostSqlRepository } from './Infrastructure/Repositories/SQL/post-sql.repository';
import { CreatePostUseCase } from './Application/UseCases/Post/create-post.usecase';
import { BlogSAController } from './Api/blog.sa.controller';
import { UpdatePostUseCase } from './Application/UseCases/Post/update-post.usecase';
import { DeletePostUseCase } from './Application/UseCases/Post/delete-post.usecase';
import { BlogService } from './Application/blog.service';

dotenv.config();

const strategies = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  JwtRefreshStrategy,
];
const useCases = [
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  DeleteSessionUseCase,
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  ResendEmailConfirmUseCase,
  PasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: process.env.SENDGREED_USERNAME,
            pass: process.env.SENDGREED_PASSWORD,
          },
        },
        defaults: {
          from: `"Chaslen2101" <Chaslen2101.itincubator@gmail.com>`,
        },
      }),
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    CqrsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5000000,
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.NEON_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
  ],
  controllers: [
    AppController,
    BlogController,
    BlogSAController,
    PostController,
    TestingController,
    UserController,
    AuthController,
    SecurityController,
  ],
  providers: [
    AppService,
    BlogService,
    BlogSqlRepository,
    BlogSqlQueryRepository,
    PostService,
    PostSqlRepository,
    PostSqlQueryRepository,
    CommentRepository,
    CommentQueryRep,
    UserService,
    UserSqlRepository,
    UserSqlQueryRepository,
    EmailService,
    AuthService,
    SessionSqlRepository,
    ...strategies,
    ...useCases,
  ],
})
export class AppModule {}
