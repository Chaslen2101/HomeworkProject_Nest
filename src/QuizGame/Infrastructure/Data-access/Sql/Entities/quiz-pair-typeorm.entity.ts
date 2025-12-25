import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizAnswerTypeormEntity } from './quiz-answer-typeorm.entity';
import { QuizQuestionTypeormEntity } from './quiz-question-typeorm.entity';
import { PairStatusEnum } from '../../../../Domain/Types/pair-status.enum';

@Entity()
export class QuizPairTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PairStatusEnum })
  status: PairStatusEnum;

  @Column('timestamp with time zone')
  pairCreatedDate: Date;

  @Column('timestamp with time zone', { nullable: true })
  startGameDate: Date | null;

  @Column('timestamp with time zone', { nullable: true })
  finishGameDate: Date | null;

  @Column({ default: 0 })
  firstPlayerScore: number;

  @Column({ default: 0 })
  secondPlayerScore: number;

  @Column('uuid')
  firstPlayerId: string;

  @Column('uuid', { nullable: true })
  secondPlayerId: string | null;

  @ManyToMany(() => QuizQuestionTypeormEntity, (questions) => questions.pairs)
  @JoinTable()
  questions: QuizQuestionTypeormEntity[];

  @ManyToOne(
    () => UserTypeormEntity,
    (firstPlayer) => firstPlayer.firstPlayerGames,
  )
  @JoinColumn({ name: 'firstPlayerId' })
  firstPlayer: UserTypeormEntity;

  @ManyToOne(
    () => UserTypeormEntity,
    (secondPlayer) => secondPlayer.secondPlayerGames,
  )
  @JoinColumn({ name: 'secondPlayerId' })
  secondPlayer: UserTypeormEntity;

  @OneToMany(() => QuizAnswerTypeormEntity, (progress) => progress.pair)
  playersAnswers: QuizAnswerTypeormEntity[];
}
