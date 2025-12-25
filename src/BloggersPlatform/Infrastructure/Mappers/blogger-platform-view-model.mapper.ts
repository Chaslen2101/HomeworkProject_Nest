import { BlogTypeormEntity } from '../Data-access/Sql/Entities/blog.typeorm-entity';
import {
  BlogViewType,
  CommentViewType,
  PostViewType,
} from '../../Api/Types/bloggers-platform.view-model.types';

export class MapToViewBloggerPlatform {
  static mapComments(comments: any[]): CommentViewType[] {
    return comments.map((comment: any) => {
      const status: string = comment.status ? comment.status : 'None';
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
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
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: Number(comment.likesCount),
        dislikesCount: Number(comment.dislikesCount),
        myStatus: status,
      },
    };
  }

  static mapPost(post: any): PostViewType {
    const status = post.status ? post.status : 'None';
    const newestLikes = post.newest_likes ? post.newest_likes : [];
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: Number(post.likesCount),
        dislikesCount: Number(post.dislikesCount),
        myStatus: status,
        newestLikes: newestLikes,
      },
    };
  }

  static mapPosts(posts: any[]): PostViewType[] {
    return posts.map((post: any): PostViewType => {
      const status = post.status ? post.status : 'None';
      const newestLikes = post.newest_likes ? post.newest_likes : [];
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: status,
          newestLikes: newestLikes,
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
