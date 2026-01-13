import { IUnitOfWork } from '../../../../Application/Interfaces/unit-of-work.interface';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export class TypeormUnitOfWork implements IUnitOfWork {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
