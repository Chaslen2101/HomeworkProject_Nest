import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserTypeormEntity } from './user-typeorm.entity';

@Entity()
export class EmailConfirmInfoTypeormEntity {
  @OneToOne(() => UserTypeormEntity)
  @JoinColumn({ name: 'userId' })
  user: UserTypeormEntity;

  @PrimaryColumn('uuid')
  userId: string;

  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;
}
