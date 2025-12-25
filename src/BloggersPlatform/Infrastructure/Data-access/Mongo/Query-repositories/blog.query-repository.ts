// import { Injectable } from '@nestjs/common';
// import { mapToView, queryHelper } from '../../Core/helper';
// import { InjectModel } from '@nestjs/mongoose';
// import { Blog, BlogDocumentType } from '../../Domain/blog.entity';
// import type { BlogModelType } from '../../Domain/blog.entity';
// import {
//   BlogQueryType,
//   BlogPagesType,
//   InputQueryType,
//   BlogViewType,
// } from '../../Types/Types';
// import { SortDirection } from 'mongodb';
//
// @Injectable()
// export class BlogQueryRep {
//   constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
//   async findManyBlogs(query: InputQueryType): Promise<BlogPagesType> {
//     const sanitizedQuery: BlogQueryType = queryHelper.blogQuery(query);
//     const filter = sanitizedQuery.searchNameTerm
//       ? { name: { $regex: sanitizedQuery.searchNameTerm, $options: 'i' } }
//       : {};
//
//     const items: BlogDocumentType[] | null = await this.BlogModel.find(filter)
//       .sort({
//         [sanitizedQuery.sortBy]: sanitizedQuery.sortDirection as SortDirection,
//       })
//       .skip((sanitizedQuery.pageNumber - 1) * sanitizedQuery.pageSize)
//       .limit(sanitizedQuery.pageSize);
//     const totalCount: number = await this.BlogModel.countDocuments(filter);
//     const mappedBlogs: BlogViewType[] = mapToView.mapBlogs(items);
//
//     return {
//       pagesCount: Math.ceil(totalCount / sanitizedQuery.pageSize),
//       page: sanitizedQuery.pageNumber,
//       pageSize: sanitizedQuery.pageSize,
//       totalCount: totalCount,
//       items: mappedBlogs,
//     };
//   }
//
//   async findBlogByID(id: string): Promise<BlogViewType | null> {
//     const notMappedBlog: BlogDocumentType | null = await this.BlogModel.findOne(
//       { _id: id },
//     );
//     if (!notMappedBlog) {
//       return null;
//     }
//
//     return mapToView.mapBlog(notMappedBlog);
//   }
// }
