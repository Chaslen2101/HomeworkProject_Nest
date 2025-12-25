import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { QuizPairTypeormEntity } from './quiz-pair-typeorm.entity';

@Entity()
export class QuizQuestionTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column('json')
  answers: string[];

  @Column('boolean')
  published: boolean;

  @Column('timestamp with time zone')
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date | null;

  @ManyToMany(() => QuizPairTypeormEntity, (pairs) => pairs.questions)
  pairs: QuizPairTypeormEntity[];
}
