import { Blog } from '../../Domain/blog.entity';
import { BlogTypeormEntity } from '../Data-access/Sql/Entities/blog.typeorm-entity';
import { Post } from '../../Domain/post.entity';
import { PostTypeormEntity } from '../Data-access/Sql/Entities/post.typeorm-entity';
import { Comment } from '../../Domain/comment.entity';
import { CommentTypeormEntity } from '../Data-access/Sql/Entities/comment.typeorm-entity';
import { LikeStatus } from '../../Domain/likeStatus.entity';
import { LikeStatusTypeormEntity } from '../Data-access/Sql/Entities/likeStatus.typeorm-entity';

export class BloggerPlatformEntityMapper {
  static blogToTypeormEntity(blogDomain: Blog): BlogTypeormEntity {
    const typeormEntity: BlogTypeormEntity = new BlogTypeormEntity();
    typeormEntity.id = blogDomain.id;
    typeormEntity.name = blogDomain.name;
    typeormEntity.description = blogDomain.description;
    typeormEntity.websiteUrl = blogDomain.websiteUrl;
    typeormEntity.createdAt = blogDomain.createdAt;
    typeormEntity.isMembership = blogDomain.isMembership;
    return typeormEntity;
  }

  static blogToDomainEntity(blogTypeorm: BlogTypeormEntity): Blog {
    return new Blog(
      blogTypeorm.id,
      blogTypeorm.name,
      blogTypeorm.description,
      blogTypeorm.websiteUrl,
      blogTypeorm.createdAt,
      blogTypeorm.isMembership,
    );
  }

  static postToTypeormEntity(postDomain: Post): PostTypeormEntity {
    const typeormEntity: PostTypeormEntity = new PostTypeormEntity();
    typeormEntity.id = postDomain.id;
    typeormEntity.title = postDomain.title;
    typeormEntity.shortDescription = postDomain.shortDescription;
    typeormEntity.content = postDomain.content;
    typeormEntity.blogId = postDomain.blogId;
    typeormEntity.blogName = postDomain.blogName;
    typeormEntity.createdAt = postDomain.createdAt;
    return typeormEntity;
  }

  static postToDomainEntity(postTypeorm: PostTypeormEntity): Post {
    return new Post(
      postTypeorm.id,
      postTypeorm.title,
      postTypeorm.shortDescription,
      postTypeorm.content,
      postTypeorm.blogId,
      postTypeorm.blogName,
      postTypeorm.createdAt,
    );
  }

  static commentToTypeormEntity(commentDomain: Comment): CommentTypeormEntity {
    const typeormEntity: CommentTypeormEntity = new CommentTypeormEntity();
    typeormEntity.id = commentDomain.id;
    typeormEntity.content = commentDomain.content;
    typeormEntity.userId = commentDomain.commentatorInfo.userId;
    typeormEntity.userLogin = commentDomain.commentatorInfo.userLogin;
    typeormEntity.createdAt = commentDomain.createdAt;
    typeormEntity.postId = commentDomain.postId;
    return typeormEntity;
  }

  static commentToDomainEntity(commentTypeorm: CommentTypeormEntity): Comment {
    return new Comment(
      commentTypeorm.id,
      commentTypeorm.content,
      {
        userId: commentTypeorm.userId,
        userLogin: commentTypeorm.userLogin,
      },
      commentTypeorm.createdAt,
      commentTypeorm.postId,
    );
  }

  static likeStatusToTypeormEntity(
    likeStatusDomain: LikeStatus,
  ): LikeStatusTypeormEntity {
    const typeormEntity: LikeStatusTypeormEntity =
      new LikeStatusTypeormEntity();
    typeormEntity.userId = likeStatusDomain.userId;
    typeormEntity.status = likeStatusDomain.status;
    typeormEntity.entityId = likeStatusDomain.entityId;
    typeormEntity.addedAt = likeStatusDomain.addedAt;
    typeormEntity.userLogin = likeStatusDomain.userLogin;
    return typeormEntity;
  }
}
