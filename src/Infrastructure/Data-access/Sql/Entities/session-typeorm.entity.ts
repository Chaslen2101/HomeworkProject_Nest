import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from './user-typeorm.entity';

@Entity()
export class SessionTypeormEntity {
  @PrimaryColumn('uuid')
  deviceId: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column()
  lastActiveDate: Date;

  @Column()
  refreshToken: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => UserTypeormEntity, (user) => user.sessions)
  @JoinColumn({ name: 'userId' })
  user: UserTypeormEntity;
}
