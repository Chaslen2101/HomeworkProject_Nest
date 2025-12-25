import { Column, Entity, JoinTable, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizPairTypeormEntity } from './quiz-pair-typeorm.entity';
import type { AnswerStatusEnum } from '../../../../Domain/Types/answer.types';

@Entity()
export class QuizAnswerTypeormEntity {
  @PrimaryColumn()
  id: string;

  @Column('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  pairId: string;

  @Column('uuid')
  questionId: string;

  @Column()
  answer: string;

  @Column()
  answerStatus: AnswerStatusEnum;

  @Column('timestamp with time zone')
  addedAt: Date;

  @ManyToOne(() => UserTypeormEntity, (user) => user.quizPairsProgress)
  @JoinTable({ name: 'userId' })
  user: UserTypeormEntity;

  @ManyToOne(() => QuizPairTypeormEntity, (pair) => pair.playersAnswers)
  @JoinTable({ name: 'pairId' })
  pair: QuizPairTypeormEntity;
}
