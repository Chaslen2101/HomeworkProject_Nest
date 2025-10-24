import { Controller, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../Domain/blog.schema';
import { User } from '../Domain/user.schema';
import { Post } from '../Domain/post.schema';
import { Comment } from '../Domain/comment.schema';
import type { BlogModelType } from '../Domain/blog.schema';
import type { UserModelType } from '../Domain/user.schema';
import type { PostModelType } from '../Domain/post.schema';
import type { CommentModelType } from '../Domain/comment.schema';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  @Delete('all-data')
  async deleteAllData(): Promise<void> {
    await this.BlogModel.deleteMany();
    await this.PostModel.deleteMany();
    await this.UserModel.deleteMany();
    await this.CommentModel.deleteMany();
    return;
  }
}
