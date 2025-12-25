import { Module } from '@nestjs/common';
import { BlogController } from './Api/blog.contoller';
import { BlogSAController } from './Api/blog.sa.controller';
import { CommentController } from './Api/comment.controller';
import { PostController } from './Api/post.controller';
import { CreateBlogUseCase } from './Application/UseCases/Blog/create-blog.usecase';
import { DeleteBlogUseCase } from './Application/UseCases/Blog/delete-blog.usecase';
import { UpdateBlogUseCase } from './Application/UseCases/Blog/update-blog.usecase';
import { CreateCommentForPostUseCase } from './Application/UseCases/Comment/create-comment-for-post.usecase';
import { DeleteCommentUseCase } from './Application/UseCases/Comment/delete-comment.usecase';
import { UpdateCommentUseCase } from './Application/UseCases/Comment/update-comment.usecase';
import { UpdateCommentLikeStatusUseCase } from './Application/UseCases/Comment/update-comment-likestatus.usecase';
import { CreatePostUseCase } from './Application/UseCases/Post/create-post.usecase';
import { DeletePostUseCase } from './Application/UseCases/Post/delete-post.usecase';
import { UpdatePostUseCase } from './Application/UseCases/Post/update-post.usecase';
import { UpdatePostLikeStatusUseCase } from './Application/UseCases/Post/update-post-likestatus.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/comment.typeorm-entity';
import { PostTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/post.typeorm-entity';
import { BlogTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/blog.typeorm-entity';
import { LikeStatusTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/likeStatus.typeorm-entity';
import { BlogSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/blog-sql.repository';
import { BlogSqlQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/blog-sql.query-repository';
import { CommentSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/comment-sql.repository';
import { CommentSqlQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/comment-sql.query-repository';
import { PostSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/post-sql.repository';
import { PostSqlQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/post-sql.query-repository';
import { LikeStatusSqlRepository } from './Infrastructure/Data-access/Sql/Repositories/like-status-sql.repository';
import { JwtService } from '@nestjs/jwt';
import { UserAccountsModule } from '../UserAccounts/user-account.module';

const useCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  CreateCommentForPostUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentTypeormEntity,
      PostTypeormEntity,
      BlogTypeormEntity,
      LikeStatusTypeormEntity,
    ]),
    UserAccountsModule,
  ],
  controllers: [
    BlogController,
    BlogSAController,
    CommentController,
    PostController,
  ],
  providers: [
    BlogSqlRepository,
    BlogSqlQueryRepository,
    CommentSqlRepository,
    CommentSqlQueryRepository,
    PostSqlRepository,
    PostSqlQueryRepository,
    LikeStatusSqlRepository,
    ...useCases,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
