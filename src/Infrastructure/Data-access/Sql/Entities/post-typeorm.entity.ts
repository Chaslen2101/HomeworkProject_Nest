import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn } from 'typeorm';
import { BlogTypeormEntity } from './blog-typeorm.entity';

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
  @JoinTable({ name: 'blogId' })
  blog: BlogTypeormEntity;
}
