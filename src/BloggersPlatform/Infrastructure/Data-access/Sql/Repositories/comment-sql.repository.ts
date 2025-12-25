import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../../../../Domain/comment.entity';
import { CommentTypeormEntity } from '../Entities/comment.typeorm-entity';
import { BloggerPlatformEntityMapper } from '../../../Mappers/blogger-platform-entity.mapper';

@Injectable()
export class CommentSqlRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(CommentTypeormEntity)
    protected commentRepository: Repository<CommentTypeormEntity>,
  ) {}
  async createNew(comment: Comment): Promise<string> {
    const newTypeormEntity: CommentTypeormEntity =
      BloggerPlatformEntityMapper.commentToTypeormEntity(comment);
    const result: CommentTypeormEntity =
      await this.commentRepository.save(newTypeormEntity);
    return result.id;
  }

  async update(comment: Comment): Promise<boolean> {
    const result = await this.commentRepository.update(
      { id: comment.id },
      {
        content: comment.content,
      },
    );
    return result.affected != 0;
  }

  async findById(id: string): Promise<Comment | null> {
    const result: CommentTypeormEntity | null =
      await this.commentRepository.findOneBy({ id: id });
    if (!result) {
      return null;
    }
    return BloggerPlatformEntityMapper.commentToDomainEntity(result);
  }

  async deleteOne(id: string): Promise<boolean> {
    const result = await this.commentRepository.delete({ id: id });
    return result.affected != 0;
  }
}
