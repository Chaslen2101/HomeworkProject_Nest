import { Injectable } from '@nestjs/common';
import {
  BlogPostQueryType,
  InputQueryType,
  PostPagesType,
  PostViewType,
} from '../../Types/Types';
import { mapToView, queryHelper } from '../../Application/helper';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocumentType } from '../../Domain/post.schema';
import type { PostModelType } from '../../Domain/post.schema';
import { ObjectId, SortDirection } from 'mongodb';

@Injectable()
export class PostQueryRep {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async findManyPosts(
    query: InputQueryType,
    id?: string,
  ): Promise<PostPagesType> {
    const sanitizedQuery: BlogPostQueryType = queryHelper.blogPostQuery(query);
    const filter: { blogId: string } | object = query.blogId
      ? { blogId: query.blogId }
      : id
        ? { blogId: id }
        : {};

    const items: PostDocumentType[] = await this.PostModel.find(filter)
      .sort({
        [sanitizedQuery.sortBy]: sanitizedQuery.sortDirection as SortDirection,
      })
      .limit(sanitizedQuery.pageSize)
      .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize);
    const totalCount: number = await this.PostModel.countDocuments(filter);

    const mappedPosts: PostViewType[] = mapToView.mapPosts(items);

    return {
      pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
      page: sanitizedQuery.pageNumber,
      pageSize: sanitizedQuery.pageSize,
      totalCount: totalCount,
      items: mappedPosts,
    };
  }

  async findPostById(postId: ObjectId | string): Promise<PostViewType | null> {
    const notMappedPost: PostDocumentType | null = await this.PostModel.findOne(
      {
        _id: postId,
      },
    );
    if (!notMappedPost) {
      return null;
    }
    return mapToView.mapPost(notMappedPost);
  }
}
