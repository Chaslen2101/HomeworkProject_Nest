import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from './user.typeorm-entity';

@Entity()
export class PasswordRecoveryInfoTypeormEntity {
  @OneToOne(() => UserTypeormEntity, (user) => user.passwordRecoveryInfo)
  @JoinColumn({ name: 'userId' })
  user: UserTypeormEntity;

  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  expirationDate: Date;

  @Column()
  confirmationCode: string;
}
