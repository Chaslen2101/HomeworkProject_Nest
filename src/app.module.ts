import { Module } from '@nestjs/common';
import { AppController } from './Api/app.controller';
import { AppService } from './Application/app.service';
import { BlogController } from './Api/blog.contoller';
import { BlogService } from './Application/blog.service';
import { BlogQueryRep } from './Infrastructure/Query-repositories/blog.query-repository';
import { BlogRepository } from './Infrastructure/Repositories/blog.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './Domain/blog.schema';
import { Post, PostSchema } from './Domain/post.schema';
import { PostService } from './Application/post.service';
import { PostRepository } from './Infrastructure/Repositories/post.repository';
import { PostQueryRep } from './Infrastructure/Query-repositories/post.query-repository';
import { PostController } from './Api/post.controller';
import { CommentQueryRep } from './Infrastructure/Query-repositories/comment.query-repository';
import { CommentController } from './Api/comment.controller';
import { Comment, CommentSchema } from './Domain/comment.schema';
import { TestingController } from './Api/testing.controller';
import { User, UserEntity } from './Domain/user.entity';
import { UserQueryRep } from './Infrastructure/Query-repositories/user.query-repository';
import { UserService } from './Application/user.service';
import { UserRepository } from './Infrastructure/Repositories/user.repository';
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
import { DeleteCommentCommandUseCase } from './Application/UseCases/Comment/delete-comment.usecase';
import { UpdateCommentUseCase } from './Application/UseCases/Comment/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './Application/UseCases/Comment/update-likestatus.usecase';
import { CreateCommentForPostUseCase } from './Application/UseCases/Post/create-comment-for-post.usecase';
import { UpdatePostLikeStatusUseCase } from './Application/UseCases/Post/update-likestatus.usecase';
import { CommentRepository } from './Infrastructure/Repositories/comment.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoginUseCase } from './Application/UseCases/Auth/login.usecase';
import { SessionRepository } from './Infrastructure/Repositories/session.repository';
import { Session, SessionEntity } from './Domain/session.entity';
import { JwtRefreshStrategy } from './Api/Guards/Jwt/refresh.strategy';
import { RefreshTokenUseCase } from './Application/UseCases/Auth/refresh-token.usecase';
import { LogoutUseCase } from './Application/UseCases/Auth/logout.usecase';
import { DeleteSessionUseCase } from './Application/UseCases/Security/delete-session.usecase';
import { SecurityController } from './Api/security.controller';
import { UserSqlRepository } from 'src/Infrastructure/Repositories/SQL/user-sql.repository';
import { RegistrationUseCase } from 'src/Application/UseCases/Auth/registration.usecase';
import { ConfirmRegistrationUseCase } from 'src/Application/UseCases/Auth/confirm-registration.usecase';
import { ResendEmailConfirmUseCase } from 'src/Application/UseCases/Auth/resend-email-confirm.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionSqlRepository } from 'src/Infrastructure/Repositories/SQL/session-sql.repository';
import { PasswordRecoveryUseCase } from 'src/Application/UseCases/Auth/password-recovery.usecase';
import { ConfirmPasswordRecoveryUseCase } from 'src/Application/UseCases/Auth/confirm-password-recovery.usecase';
import { UserSqlQueryRepository } from 'src/Infrastructure/Query-repositories/SQL/user-sql.query-repository';
// import { TypeOrmModule } from '@nestjs/typeorm';
dotenv.config();

const strategies = [
  LocalStrategy,
  JwtStrategy,
  BasicStrategy,
  JwtRefreshStrategy,
];
const useCases = [
  DeleteCommentCommandUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  CreateCommentForPostUseCase,
  UpdatePostLikeStatusUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  DeleteSessionUseCase,
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  ResendEmailConfirmUseCase,
  PasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
];
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserEntity }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionEntity }]),
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
      signOptions: { expiresIn: '10s' },
    }),
    CqrsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
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
    PostController,
    CommentController,
    TestingController,
    UserController,
    AuthController,
    SecurityController,
  ],
  providers: [
    AppService,
    BlogService,
    BlogRepository,
    BlogQueryRep,
    PostService,
    PostRepository,
    PostQueryRep,
    CommentRepository,
    CommentQueryRep,
    UserService,
    UserSqlRepository,
    UserSqlQueryRepository,
    UserQueryRep,
    EmailService,
    AuthService,
    SessionRepository,
    SessionSqlRepository,
    ...strategies,
    ...useCases,
  ],
})
export class AppModule {}
