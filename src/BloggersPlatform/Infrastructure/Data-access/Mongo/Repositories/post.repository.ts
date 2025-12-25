// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Post, PostDocumentType } from '../../Domain/post.entity';
// import type { PostModelType } from '../../Domain/post.entity';
//
// @Injectable()
// export class PostRepository {
//   constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
//
//   async save(post: PostDocumentType): Promise<PostDocumentType> {
//     return await post.save();
//   }
//
//   async findById(postId: string): Promise<PostDocumentType | null> {
//     return await this.PostModel.findOne({ _id: postId });
//   }
//
//   async delete(postId: string): Promise<boolean> {
//     const result = await this.PostModel.deleteOne({ _id: postId });
//     return result.deletedCount !== 0;
//   }
// }
