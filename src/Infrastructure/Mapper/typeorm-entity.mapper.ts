import {
  EmailConfirmationInfo,
  PasswordRecoveryInfo,
  User,
} from '../../Domain/user.entity';
import { UserTypeormEntity } from '../Data-access/Sql/Entities/user-typeorm.entity';
import { EmailConfirmInfoTypeormEntity } from '../Data-access/Sql/Entities/emailConfirmInfo-typeorm.entity';
import { SessionTypeormEntity } from '../Data-access/Sql/Entities/session-typeorm.entity';
import { Session } from '../../Domain/session.entity';
import { PasswordRecoveryInfoTypeormEntity } from '../Data-access/Sql/Entities/passwordRecoveryInfo-typeorm.entity';
import { BlogTypeormEntity } from '../Data-access/Sql/Entities/blog-typeorm.entity';
import { Blog } from '../../Domain/blog.entity';
import { Post } from '../../Domain/post.entity';
import { PostTypeormEntity } from '../Data-access/Sql/Entities/post-typeorm.entity';
import { Comment } from '../../Domain/comment.entity';
import { CommentTypeormEntity } from '../Data-access/Sql/Entities/comment-typeorm.entity';
import { LikeStatus } from '../../Domain/likeStatus.entity';
import { LikeStatusTypeormEntity } from '../Data-access/Sql/Entities/likeStatus-typeorm.entity';

export class TypeormEntityMapper {
  static userToTypeormEntity(userDomain: User): UserTypeormEntity {
    const typeormEntity: UserTypeormEntity = new UserTypeormEntity();
    typeormEntity.id = userDomain.id;
    typeormEntity.email = userDomain.email;
    typeormEntity.password = userDomain.password;
    typeormEntity.createdAt = userDomain.createdAt;
    typeormEntity.login = userDomain.login;
    return typeormEntity;
  }

  static userToDomainEntity(userTypeorm: UserTypeormEntity): User {
    return new User(
      userTypeorm.id,
      userTypeorm.login,
      userTypeorm.email,
      userTypeorm.password,
      userTypeorm.createdAt,
    );
  }

  static emailConfirmInfoToTypeormEntity(
    emailConfirmInfoDomain: EmailConfirmationInfo,
  ): EmailConfirmInfoTypeormEntity {
    const typeormEntity: EmailConfirmInfoTypeormEntity =
      new EmailConfirmInfoTypeormEntity();
    typeormEntity.isConfirmed = emailConfirmInfoDomain.isConfirmed;
    typeormEntity.confirmationCode = emailConfirmInfoDomain.confirmationCode;
    typeormEntity.expirationDate = emailConfirmInfoDomain.expirationDate;
    typeormEntity.userId = emailConfirmInfoDomain.userId;
    return typeormEntity;
  }

  static emailConfirmInfoToDomainEntity(
    emailConfirmInfoTypeorm: EmailConfirmInfoTypeormEntity,
  ): EmailConfirmationInfo {
    return new EmailConfirmationInfo(
      emailConfirmInfoTypeorm.userId,
      emailConfirmInfoTypeorm.confirmationCode,
      emailConfirmInfoTypeorm.expirationDate,
      emailConfirmInfoTypeorm.isConfirmed,
    );
  }

  static sessionToTypeormEntity(sessionDomain: Session): SessionTypeormEntity {
    const typeormEntity: SessionTypeormEntity = new SessionTypeormEntity();
    typeormEntity.ip = sessionDomain.ip;
    typeormEntity.title = sessionDomain.title;
    typeormEntity.lastActiveDate = sessionDomain.lastActiveDate;
    typeormEntity.refreshToken = sessionDomain.refreshToken;
    typeormEntity.deviceId = sessionDomain.deviceId;
    typeormEntity.userId = sessionDomain.userId;
    return typeormEntity;
  }

  static sessionToDomainEntity(sessionTypeorm: SessionTypeormEntity): Session {
    return new Session(
      sessionTypeorm.userId,
      sessionTypeorm.ip,
      sessionTypeorm.title,
      sessionTypeorm.lastActiveDate,
      sessionTypeorm.deviceId,
      sessionTypeorm.refreshToken,
    );
  }

  static passwordRecoveryToTypeormEntity(
    passwordRecoveryDomain: PasswordRecoveryInfo,
  ): PasswordRecoveryInfoTypeormEntity {
    const typeormEntity: PasswordRecoveryInfoTypeormEntity =
      new PasswordRecoveryInfoTypeormEntity();
    typeormEntity.userId = passwordRecoveryDomain.userId;
    typeormEntity.confirmationCode = passwordRecoveryDomain.confirmationCode;
    typeormEntity.expirationDate = passwordRecoveryDomain.expirationDate;
    return typeormEntity;
  }

  static passwordRecoveryToDomainEntity(
    passwordRecoveryTypeorm: PasswordRecoveryInfoTypeormEntity,
  ): PasswordRecoveryInfo {
    return new PasswordRecoveryInfo(
      passwordRecoveryTypeorm.userId,
      passwordRecoveryTypeorm.confirmationCode,
      passwordRecoveryTypeorm.expirationDate,
    );
  }

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
