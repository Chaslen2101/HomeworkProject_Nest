import { Injectable } from '@nestjs/common';
import {
  AccessTokenPayloadType,
  BlogPostQueryType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../../Types/Types';
import { mapToView, queryHelper } from '../../Core/helper';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocumentType } from '../../Domain/post.schema';
import type { PostModelType } from '../../Domain/post.schema';
import { SortDirection } from 'mongodb';

@Injectable()
export class PostQueryRep {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async findManyPosts(
    query: InputQueryType,
    user?: AccessTokenPayloadType,
    blogId?: string,
  ): Promise<PostPagesType> {
    const sanitizedQuery: BlogPostQueryType = queryHelper.blogPostQuery(query);
    const filter: { blogId: string } | object = query.blogId
      ? { blogId: query.blogId }
      : blogId
        ? { blogId: blogId }
        : {};

    const items: PostDocumentType[] = await this.PostModel.find(filter)
      .sort({
        [sanitizedQuery.sortBy]: sanitizedQuery.sortDirection as SortDirection,
      })
      .limit(sanitizedQuery.pageSize)
      .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize);
    const totalCount: number = await this.PostModel.countDocuments(filter);

    const mappedPosts: PostViewType[] = mapToView.mapPosts(items, user?.sub);

    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedPosts,
    };
  }

  async findPostById(
    postId: string,
    user?: AccessTokenPayloadType,
  ): Promise<PostViewType | null> {
    const notMappedPost: PostDocumentType | null = await this.PostModel.findOne(
      {
        _id: postId,
      },
    );
    if (!notMappedPost) {
      return null;
    }
    return mapToView.mapPost(notMappedPost, user?.sub);
  }
}
