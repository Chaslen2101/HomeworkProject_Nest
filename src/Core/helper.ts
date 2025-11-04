import {
  CommentViewType,
  InputQueryType,
  UserViewType,
  SessionsInfoDBType,
  SessionsInfoViewType,
  PostViewType,
  BlogViewType,
  BlogPostQueryType,
  UserQueryType,
  CommentQueryType,
  QueryHelperType,
  NewestLikesType,
} from '../Types/Types';
import { PostDocumentType } from '../Domain/post.schema';
import { BlogDocumentType } from '../Domain/blog.schema';
import { CommentDocumentType } from '../Domain/comment.schema';
import { UserDocumentType } from '../Domain/user.schema';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export const queryHelper: QueryHelperType = {
  blogPostQuery(query: InputQueryType): BlogPostQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchNameTerm: query.searchNameTerm ? query.searchNameTerm : null,
    };
  },

  userQuery(query: InputQueryType): UserQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      searchLoginTerm: query.searchLoginTerm ? query.searchLoginTerm : null,
      searchEmailTerm: query.searchEmailTerm ? query.searchEmailTerm : null,
    };
  },

  commentsQuery(query: InputQueryType): CommentQueryType {
    return {
      pageNumber: query.pageNumber ? +query.pageNumber : 1,
      pageSize: query.pageSize ? +query.pageSize : 10,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    };
  },
};

export const hashHelper = {
  async hashNewPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  async comparePassword(hashedPassword: string, somePassword: string) {
    return await bcrypt.compare(somePassword, hashedPassword);
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

  mapUsers(users: UserDocumentType[]): UserViewType[] {
    return users.map((user: UserDocumentType) => {
      return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  },

  mapUser(userData: UserDocumentType): UserViewType {
    return {
      id: userData._id.toString(),
      login: userData.login,
      email: userData.email,
      createdAt: userData.createdAt,
    };
  },

  mapSessionsInfo(sessionsInfo: SessionsInfoDBType[]): SessionsInfoViewType[] {
    return sessionsInfo.map((sessionInfo) => {
      return {
        ip: sessionInfo.ip,
        title: sessionInfo.title,
        lastActiveDate: sessionInfo.lastActiveDate,
        deviceId: sessionInfo.deviceId,
      };
    });
  },

  mapSessionInfo(sessionInfo: SessionsInfoDBType): SessionsInfoViewType {
    return {
      ip: sessionInfo.ip,
      title: sessionInfo.title,
      lastActiveDate: sessionInfo.lastActiveDate,
      deviceId: sessionInfo.deviceId,
    };
  },

  mapPost(post: PostDocumentType, userId?: string): PostViewType {
    let status: string = 'None';

    if (userId) {
      if (post.likesInfo.likedBy.includes(userId)) {
        status = 'Like';
      }
      if (post.likesInfo.dislikedBy.includes(userId)) {
        status = 'Dislike';
      }
    }

    const newestLikes: NewestLikesType[] = post.likesInfo.newestLikes.map(
      (newestLike) => {
        return {
          addedAt: newestLike.addedAt,
          userId: newestLike.userId,
          login: newestLike.login,
        };
      },
    );
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesInfo.likedBy.length,
        dislikesCount: post.likesInfo.dislikedBy.length,
        myStatus: status,
        newestLikes: newestLikes,
      },
    };
  },

  mapPosts(posts: PostDocumentType[], userId?: string): PostViewType[] {
    return posts.map((post) => {
      let status: string = 'None';

      if (userId) {
        if (post.likesInfo.likedBy.includes(userId)) {
          status = 'Like';
        }
        if (post.likesInfo.dislikedBy.includes(userId)) {
          status = 'Dislike';
        }
      }
      const newestLikes: NewestLikesType[] = post.likesInfo.newestLikes.map(
        (newestLike) => {
          return {
            addedAt: newestLike.addedAt,
            userId: newestLike.userId,
            login: newestLike.login,
          };
        },
      );
      return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: post.likesInfo.likedBy.length,
          dislikesCount: post.likesInfo.dislikedBy.length,
          myStatus: status,
          newestLikes: newestLikes,
        },
      };
    });
  },

  mapBlog(blog: BlogDocumentType): BlogViewType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  },

  mapBlogs(blogs: BlogDocumentType[]): BlogViewType[] {
    return blogs.map((blog: BlogDocumentType) => {
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      };
    });
  },
};
