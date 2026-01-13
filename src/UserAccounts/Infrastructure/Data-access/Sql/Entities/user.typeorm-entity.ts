import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { EmailConfirmInfoTypeormEntity } from './emailConfirmInfo.typeorm-entity';
import { PasswordRecoveryInfoTypeormEntity } from './passwordRecoveryInfo.typeorm-entity';
import { SessionTypeormEntity } from './session.typeorm-entity';
import { CommentTypeormEntity } from '../../../../../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/comment.typeorm-entity';
import { LikeStatusTypeormEntity } from '../../../../../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/likeStatus.typeorm-entity';
import { QuizPairTypeormEntity } from '../../../../../QuizGame/Infrastructure/Data-access/Sql/Entities/quiz-pair.typeorm-entity';
import { QuizAnswerTypeormEntity } from '../../../../../QuizGame/Infrastructure/Data-access/Sql/Entities/quiz-answer.typeorm-entity';
import { QuizStatisticTypeormEntity } from '../../../../../QuizGame/Infrastructure/Data-access/Sql/Entities/quiz-statistic.typeorm-entity';

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

  @OneToMany(() => QuizPairTypeormEntity, (quizGame) => quizGame.firstPlayer)
  firstPlayerGames: QuizPairTypeormEntity[];

  @OneToMany(() => QuizPairTypeormEntity, (quizGame) => quizGame.secondPlayer)
  secondPlayerGames: QuizPairTypeormEntity[];

  @OneToMany(
    () => QuizAnswerTypeormEntity,
    (quizGamesProgress) => quizGamesProgress.user,
  )
  quizPairsProgress: QuizAnswerTypeormEntity;

  @OneToOne(
    () => QuizStatisticTypeormEntity,
    (quizGameStatistic) => quizGameStatistic.user,
  )
  quizGameStatistic: QuizStatisticTypeormEntity;
}
