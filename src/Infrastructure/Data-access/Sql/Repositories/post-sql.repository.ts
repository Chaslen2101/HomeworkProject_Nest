import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../../../Domain/post.entity';
import { PostTypeormEntity } from '../Entities/post-typeorm.entity';
import { TypeormEntityMapper } from '../../../Mapper/typeorm-entity.mapper';

@Injectable()
export class PostSqlRepository {
  constructor(
    @InjectDataSource() public dataSource: DataSource,
    @InjectRepository(PostTypeormEntity)
    protected postRepository: Repository<PostTypeormEntity>,
  ) {}

  async createNewPost(post: Post): Promise<string> {
    const newPostTypeormEntity: PostTypeormEntity =
      TypeormEntityMapper.postToTypeormEntity(post);
    const result: PostTypeormEntity =
      await this.postRepository.save(newPostTypeormEntity);
    return result.id;
  }

  async updatePost(post: Post): Promise<boolean> {
    const result = await this.postRepository.update(
      { id: post.id },
      {
        title: post.title,
        content: post.content,
        shortDescription: post.shortDescription,
      },
    );
    return result.affected != 0;
  }

  async findById(postId: string): Promise<Post | null> {
    const result: PostTypeormEntity | null =
      await this.postRepository.findOneBy({ id: postId });
    if (!result) {
      return null;
    }
    return TypeormEntityMapper.postToDomainEntity(result);
  }

  async delete(postId: string): Promise<boolean> {
    const result = await this.postRepository.delete({ id: postId });
    return result.affected != 0;
  }
}
