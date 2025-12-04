import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserTypeormEntity } from './user-typeorm.entity';
import { PostTypeormEntity } from './post-typeorm.entity';

@Entity()
export class LikeStatusTypeormEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  status: string;

  @PrimaryColumn('uuid')
  entityId: string;

  @Column('timestamp with time zone')
  addedAt: Date;

  @Column()
  userLogin: string;

  @ManyToOne(() => UserTypeormEntity, (user) => user.comments)
  @JoinTable({ name: 'userId' })
  user: UserTypeormEntity;

  @ManyToOne(() => PostTypeormEntity, (post) => post.likes)
  post: PostTypeormEntity;
}
