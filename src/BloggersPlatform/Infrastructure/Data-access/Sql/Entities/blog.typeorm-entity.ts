import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { PostTypeormEntity } from './post.typeorm-entity';

@Entity()
export class BlogTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @OneToMany(
    () => PostTypeormEntity,
    (postTypeormEntity) => postTypeormEntity.blog,
  )
  posts: PostTypeormEntity[];
}
