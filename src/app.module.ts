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
import { User, UserSchema } from './Domain/user.schema';
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
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  ],
  controllers: [
    AppController,
    BlogController,
    PostController,
    CommentController,
    TestingController,
    UserController,
    AuthController,
  ],
  providers: [
    AppService,
    BlogService,
    BlogRepository,
    BlogQueryRep,
    PostService,
    PostRepository,
    PostQueryRep,
    CommentQueryRep,
    UserService,
    UserRepository,
    UserQueryRep,
    EmailService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AppModule {}
