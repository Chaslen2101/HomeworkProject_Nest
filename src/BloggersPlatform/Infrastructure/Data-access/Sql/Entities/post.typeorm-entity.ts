import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { BlogTypeormEntity } from './blog.typeorm-entity';
import { CommentTypeormEntity } from './comment.typeorm-entity';
import { LikeStatusTypeormEntity } from './likeStatus.typeorm-entity';

@Entity()
export class PostTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column('uuid')
  blogId: string;

  @Column()
  blogName: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @ManyToOne(
    () => BlogTypeormEntity,
    (blogTypeormEntity) => blogTypeormEntity.posts,
  )
  @JoinColumn({ name: 'blogId' })
  blog: BlogTypeormEntity;

  @OneToMany(() => CommentTypeormEntity, (comments) => comments.post)
  comments: CommentTypeormEntity[];

  @OneToMany(() => LikeStatusTypeormEntity, (likes) => likes.post)
  likes: LikeStatusTypeormEntity[];
}
