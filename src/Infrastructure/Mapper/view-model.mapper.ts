import {
  BlogViewType,
  CommentViewType,
  MyInfoType,
  PostViewType,
  SessionViewType,
  UserViewType,
} from '../../Domain/Types/Types';
import { UserTypeormEntity } from '../Data-access/Sql/Entities/user-typeorm.entity';
import { SessionTypeormEntity } from '../Data-access/Sql/Entities/session-typeorm.entity';
import { PostTypeormEntity } from '../Data-access/Sql/Entities/post-typeorm.entity';
import { BlogTypeormEntity } from '../Data-access/Sql/Entities/blog-typeorm.entity';

export class mapToView {
  static mapComments(comments: any[]): CommentViewType[] {
    return comments.map((comment: any) => {
      const status: string = comment.status ? comment.status : 'None';
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.user_id,
          userLogin: comment.user_login,
        },
        createdAt: comment.created_at,
        likesInfo: {
          likesCount: Number(comment.likes_count),
          dislikesCount: Number(comment.dislikes_count),
          myStatus: status,
        },
      };
    });
  }

  static mapComment(comment: any): CommentViewType {
    const status = comment.status ? comment.status : 'None';
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.user_id,
        userLogin: comment.user_login,
      },
      createdAt: comment.created_at,
      likesInfo: {
        likesCount: Number(comment.likes_count),
        dislikesCount: Number(comment.dislikes_count),
        myStatus: status,
      },
    };
  }

  static mapUsers(users: UserTypeormEntity[]): UserViewType[] {
    return users.map((user: UserTypeormEntity) => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  }

  static mapUser(userData: UserTypeormEntity): UserViewType {
    return {
      id: userData.id,
      login: userData.login,
      email: userData.email,
      createdAt: userData.createdAt,
    };
  }

  static mapMyInfo(userData: UserTypeormEntity): MyInfoType {
    return {
      email: userData.email,
      login: userData.login,
      userId: userData.id,
    };
  }

  static mapSessionsInfo(sessions: SessionTypeormEntity[]): SessionViewType[] {
    return sessions.map((sessionInfo: SessionTypeormEntity) => {
      return {
        deviceId: sessionInfo.deviceId,
        ip: sessionInfo.ip,
        lastActiveDate: sessionInfo.lastActiveDate,
        title: sessionInfo.title,
      };
    });
  }

  // mapSessionInfo(sessionInfo: SessionsInfoDBType): SessionsInfoViewType {
  //   return {
  //     ip: sessionInfo.ip,
  //     title: sessionInfo.title,
  //     lastActiveDate: sessionInfo.lastActiveDate,
  //     deviceId: sessionInfo.deviceId,
  //   };
  // },

  static mapPost(post: PostTypeormEntity): PostViewType {
    // const status = post.status ? post.status : 'None';
    // const newestLikes = post.newest_likes ? post.newest_likes : [];
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }

  static mapPosts(posts: PostTypeormEntity[]): PostViewType[] {
    return posts.map((post: PostTypeormEntity): PostViewType => {
      // const status = post.status ? post.status : 'None';
      // const newestLikes = post.newest_likes ? post.newest_likes : [];
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    });
  }

  static mapBlog(blog: BlogTypeormEntity): BlogViewType {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  static mapBlogs(blogs: BlogTypeormEntity[]): BlogViewType[] {
    return blogs.map((blog: BlogTypeormEntity): BlogViewType => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      };
    });
  }
}
