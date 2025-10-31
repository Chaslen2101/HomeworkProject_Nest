import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PostDocumentType, PostModelType } from './post.schema';
import { BlogInputDTO } from '../Api/Input-dto/blog.input-dto';
import { PostInputType } from '../Api/Input-dto/post.input-dto';

@Schema()
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: MongooseSchema.Types.Date, required: true })
  createdAt: Date;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  @Prop({ type: [String], default: [] })
  posts: string[];

  static createBlog(
    this: BlogModelType,
    newBlogData: BlogInputDTO,
  ): BlogDocumentType {
    const newBlog: BlogDocumentType = new this();
    newBlog.name = newBlogData.name;
    newBlog.description = newBlogData.description;
    newBlog.websiteUrl = newBlogData.websiteUrl;
    newBlog.createdAt = new Date();
    newBlog.isMembership = false;
    return newBlog;
  }

  updateBlogData(this: BlogDocumentType, newBlogData: BlogInputDTO): boolean {
    this.name = newBlogData.name;
    this.description = newBlogData.description;
    this.websiteUrl = newBlogData.websiteUrl;
    return true;
  }

  createPostForBlog(
    this: BlogDocumentType,
    newPostData: PostInputType,
    PostModel: PostModelType,
  ): PostDocumentType {
    const newPost: PostDocumentType = new PostModel({
      title: newPostData.title,
      shortDescription: newPostData.shortDescription,
      content: newPostData.content,
      blogId: this._id,
      blogName: this.name,
      createdAt: new Date(),
      comments: [],
      likesInfo: {
        likedBy: [],
        dislikedBy: [],
        newestLikes: [],
      },
    });
    this.posts.push(newPost._id.toString());
    return newPost;
  }

  deletePost(this: BlogDocumentType, postId: string): boolean {
    const isPostExist: number = this.posts.indexOf(postId);
    if (isPostExist === -1) {
      throw new Error("Blog doesn't have post with this id");
    }
    this.posts.splice(isPostExist, 1);
    return true;
  }
}
export type BlogDocumentType = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocumentType> & typeof Blog;
export const BlogSchema: MongooseSchema<Blog> =
  SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);

// export const BlogSchema: MongooseSchema<
//   BlogDBType,
//   BlogModelType,
//   BlogInstanceMethodsType
// > = new mongoose.Schema(
//   {
//     id: String,
//     name: String,
//     description: String,
//     websiteUrl: String,
//     createdAt: MongooseSchema.Types.Date,
//     isMembership: Boolean,
//     posts: { type: [String], default: [] },
//   },
//   {
//     // methods: {
//     //   updateBlogData(this: BlogInstanceType, newBlogData: BlogInputType) {
//     //     this.name = newBlogData.name;
//     //     this.description = newBlogData.description;
//     //     this.websiteUrl = newBlogData.websiteUrl;
//     //     return true;
//     //   },
//     //
//     //   createPostForBlog(this: BlogInstanceType, newPostData: PostInputType) {
//     //     const newPost: PostInstanceType = new PostModel({
//     //       id: new ObjectId().toString(),
//     //       title: newPostData.title,
//     //       shortDescription: newPostData.shortDescription,
//     //       content: newPostData.content,
//     //       blogId: this.id,
//     //       blogName: this.name,
//     //       createdAt: new Date(),
//     //       comments: [],
//     //       likesInfo: {
//     //         likedBy: [],
//     //         dislikedBy: [],
//     //         newestLikes: [],
//     //       },
//     //     });
//     //
//     //     this.posts.push(newPost.id);
//     //
//     //     return newPost;
//     //   },
//     //
//     //   deletePost(this: BlogInstanceType, postId: string) {
//     //     const isPostExist: number = this.posts.indexOf(postId);
//     //     if (isPostExist === -1) {
//     //       throw new Error("Post doesn't exist");
//     //     }
//     //     this.posts.splice(isPostExist, 1);
//     //     return true;
//     //   },
//     // },
//     statics: {
//       createBlog(
//         this: BlogModelType,
//         newBlogData: BlogInputType,
//       ): BlogInstanceType {
//         return new this({
//           id: new ObjectId().toString(),
//           name: newBlogData.name,
//           description: newBlogData.description,
//           websiteUrl: newBlogData.websiteUrl,
//           createdAt: new Date(),
//           isMembership: false,
//         }) as BlogInstanceType;
//       },
//     },
//   },
// );
//
// export type BlogInstanceMethodsType = object;
// export type BlogModelType = Model<
//   BlogDBType,
//   object,
//   BlogInstanceMethodsType
// > & {
//   createBlog(newBlogData: BlogInputType): BlogInstanceType;
// };
// export type BlogInstanceType = HydratedDocument<
//   BlogDBType,
//   BlogInstanceMethodsType
// >;
