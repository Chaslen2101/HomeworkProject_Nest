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

  static mapPost(post: any): PostViewType {
    const status = post.status ? post.status : 'None';
    const newestLikes = post.newest_likes ? post.newest_likes : [];
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.short_description,
      content: post.content,
      blogId: post.blog_id,
      blogName: post.blog_name,
      createdAt: post.created_at,
      extendedLikesInfo: {
        likesCount: Number(post.likes_count),
        dislikesCount: Number(post.dislikes_count),
        myStatus: status,
        newestLikes: newestLikes,
      },
    };
  }

  static mapPosts(posts: any[]): PostViewType[] {
    return posts.map((post): any => {
      const status = post.status ? post.status : 'None';
      const newestLikes = post.newest_likes ? post.newest_likes : [];
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.short_description,
        content: post.content,
        blogId: post.blog_id,
        blogName: post.blog_name,
        createdAt: post.created_at,
        extendedLikesInfo: {
          likesCount: Number(post.likes_count),
          dislikesCount: Number(post.dislikes_count),
          myStatus: status,
          newestLikes: newestLikes,
        },
      };
    });
  }

  static mapBlog(blog: any): BlogViewType {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.website_url,
      createdAt: blog.created_at,
      isMembership: blog.is_membership,
    };
  }

  static mapBlogs(blogs: any[]): BlogViewType[] {
    return blogs.map((blog: any) => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.website_url,
        createdAt: blog.created_at,
        isMembership: blog.is_membership,
      };
    });
  }
}
