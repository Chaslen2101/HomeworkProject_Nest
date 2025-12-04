import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { EmailConfirmInfoTypeormEntity } from './emailConfirmInfo-typeorm.entity';
import { PasswordRecoveryInfoTypeormEntity } from './passwordRecoveryInfo-typeorm.entity';
import { SessionTypeormEntity } from './session-typeorm.entity';
import { CommentTypeormEntity } from './comment-typeorm.entity';
import { LikeStatusTypeormEntity } from './likeStatus-typeorm.entity';

@Entity()
export class UserTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column('timestamp with time zone')
  createdAt: Date;

  @OneToOne(
    () => EmailConfirmInfoTypeormEntity,
    (emailConfirmInfo) => emailConfirmInfo.user,
  )
  emailConfirmInfo: EmailConfirmInfoTypeormEntity;

  @OneToOne(
    () => PasswordRecoveryInfoTypeormEntity,
    (passwordRecoveryInfo) => passwordRecoveryInfo.user,
  )
  passwordRecoveryInfo: PasswordRecoveryInfoTypeormEntity;

  @OneToMany(() => SessionTypeormEntity, (sessions) => sessions.user)
  sessions: SessionTypeormEntity[];

  @OneToMany(() => CommentTypeormEntity, (comment) => comment.user)
  comments: CommentTypeormEntity[];

  @OneToMany(() => LikeStatusTypeormEntity, (likes) => likes.user)
  likes: LikeStatusTypeormEntity[];
}
