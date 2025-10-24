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
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [
    AppController,
    BlogController,
    PostController,
    CommentController,
    TestingController,
    UserController,
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
  ],
})
export class AppModule {}
