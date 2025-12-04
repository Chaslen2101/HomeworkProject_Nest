import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from './user-typeorm.entity';
import { PostTypeormEntity } from './post-typeorm.entity';

@Entity()
export class CommentTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column('uuid')
  userId: string;

  @Column()
  userLogin: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column('uuid')
  postId: string;

  @ManyToOne(() => UserTypeormEntity, (user) => user.comments)
  @JoinColumn({ name: 'userId' })
  user: UserTypeormEntity;

  @ManyToOne(() => PostTypeormEntity, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: PostTypeormEntity;
}
