import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from '../../../../../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';

@Entity()
export class QuizStatisticTypeormEntity {
  @PrimaryColumn()
  userId: string;

  @Column()
  sumScore: number;

  @Column()
  avgScores: number;

  @Column()
  gamesCount: number;

  @Column()
  winsCount: number;

  @Column()
  lossesCount: number;

  @Column()
  drawsCount: number;

  @OneToOne(() => UserTypeormEntity, (user) => user.quizGameStatistic)
  @JoinColumn({ name: 'userId' })
  user: UserTypeormEntity;
}
