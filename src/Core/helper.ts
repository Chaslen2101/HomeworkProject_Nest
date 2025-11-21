import {
  CommentViewType,
  InputQueryType,
  UserViewType,
  SessionViewType,
  PostViewType,
  BlogViewType,
  BlogQueryType,
  UserQueryType,
  CommentQueryType,
  QueryHelperType,
  NewestLikesType,
  PostQueryType,
} from '../Types/Types';
import { CommentDocumentType } from '../Domain/comment.schema';
import * as argon2 from 'argon2';

export const queryHelper: QueryHelperType = {
  blogQuery(query: InputQueryType): BlogQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'created_at',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchNameTerm: query.searchNameTerm ? query.searchNameTerm : '%%',
    };
  },

  postQuery(query: InputQueryType, blogId?: string): PostQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'created_at',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      blogId: blogId ? blogId : null,
    };
  },

  userQuery(query: InputQueryType): UserQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'created_at',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : '%%',
      searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : '%%',
    };
  },

  commentsQuery(query: InputQueryType): CommentQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'created_at',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  },

  toSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  },
};

export const hashHelper = {
  async hash(smthToHash: string): Promise<string> {
    return await argon2.hash(smthToHash, {
      type: argon2.argon2id, // Лучший вариант - защита от GPU и side-channel атак
      memoryCost: 2 ** 16, // 64 MB памяти
      timeCost: 3, // 3 итерации
      parallelism: 1, // 1 поток
      hashLength: 32, // 32 байта хеш
    });
  },

  async compare(someStringToComp: string, hashedString: string) {
    return await argon2.verify(hashedString, someStringToComp);
  },
};

export const mapToView = {
  mapComments(
    comments: CommentDocumentType[],
    userId?: string,
  ): CommentViewType[] {
    return comments.map((comment: CommentDocumentType) => {
      let status: string = 'None';

      if (userId) {
        if (comment.likesInfo.likedBy.includes(userId)) {
          status = 'Like';
        }
        if (comment.likesInfo.dislikedBy.includes(userId)) {
          status = 'Dislike';
        }
      }
      return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: comment.likesInfo.likedBy.length,
          dislikesCount: comment.likesInfo.dislikedBy.length,
          myStatus: status,
        },
      };
    });
  },

  mapComment(comment: CommentDocumentType, userId?: string): CommentViewType {
    let status: string = 'None';

    if (userId) {
      if (comment.likesInfo.likedBy.includes(userId)) {
        status = 'Like';
      }
      if (comment.likesInfo.dislikedBy.includes(userId)) {
        status = 'Dislike';
      }
    }
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likedBy.length,
        dislikesCount: comment.likesInfo.dislikedBy.length,
        myStatus: status,
      },
    };
  },

  mapUsers(users: any[]): UserViewType[] {
    return users.map((user: any) => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.created_at,
      };
    });
  },

  mapUser(userData: any): UserViewType {
    return {
      id: userData.id,
      login: userData.login,
      email: userData.email,
      createdAt: userData.created_at,
    };
  },

  mapSessionsInfo(sessions: any[]): SessionViewType[] {
    return sessions.map((sessionInfo: any) => {
      return {
        ip: sessionInfo.ip,
        title: sessionInfo.title,
        lastActiveDate: sessionInfo.last_active_date,
        deviceId: sessionInfo.device_id,
      };
    });
  },

  // mapSessionInfo(sessionInfo: SessionsInfoDBType): SessionsInfoViewType {
  //   return {
  //     ip: sessionInfo.ip,
  //     title: sessionInfo.title,
  //     lastActiveDate: sessionInfo.lastActiveDate,
  //     deviceId: sessionInfo.deviceId,
  //   };
  // },

  mapPost(post: any, userId?: string): PostViewType {
    // let status: string = 'None';
    //
    // if (userId) {
    //   if (post.likesInfo.likedBy.includes(userId)) {
    //     status = 'Like';
    //   }
    //   if (post.likesInfo.dislikedBy.includes(userId)) {
    //     status = 'Dislike';
    //   }
    // }
    //
    // const newestLikes: NewestLikesType[] = post.likesInfo.newestLikes.map(
    //   (newestLike) => {
    //     return {
    //       addedAt: newestLike.addedAt,
    //       userId: newestLike.userId,
    //       login: newestLike.login,
    //     };
    //   },
    // );
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.short_description,
      content: post.content,
      blogId: post.blog_id,
      blogName: post.blog_name,
      createdAt: post.created_at,
      extendedLikesInfo: {
        likesCount: 0, //post.likesInfo.likedBy.length,
        dislikesCount: 0, //post.likesInfo.dislikedBy.length,
        myStatus: 'None', //status,
        newestLikes: [], //newestLikes,
      },
    };
  },

  mapPosts(posts: any[], userId?: string): PostViewType[] {
    return posts.map((post): any => {
      // let status: string = 'None';
      //
      // if (userId) {
      //   if (post.likesInfo.likedBy.includes(userId)) {
      //     status = 'Like';
      //   }
      //   if (post.likesInfo.dislikedBy.includes(userId)) {
      //     status = 'Dislike';
      //   }
      // }
      // const newestLikes: NewestLikesType[] = post.likesInfo.newestLikes.map(
      //   (newestLike) => {
      //     return {
      //       addedAt: newestLike.addedAt,
      //       userId: newestLike.userId,
      //       login: newestLike.login,
      //     };
      //   },
      // );
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.short_description,
        content: post.content,
        blogId: post.blog_id,
        blogName: post.blog_name,
        createdAt: post.created_at,
        extendedLikesInfo: {
          likesCount: 0, //post.likesInfo.likedBy.length,
          dislikesCount: 0, //post.likesInfo.dislikedBy.length,
          myStatus: 'None', //status,
          newestLikes: [], //newestLikes,
        },
      };
    });
  },

  mapBlog(blog: any): BlogViewType {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.website_url,
      createdAt: blog.created_at,
      isMembership: blog.is_membership,
    };
  },

  mapBlogs(blogs: any[]): BlogViewType[] {
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
  },
};
