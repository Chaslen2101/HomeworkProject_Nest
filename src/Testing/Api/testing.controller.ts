import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');

    try {
      // 1. Быстрый способ для Postgres: TRUNCATE всех таблиц разом
      await this.dataSource.query(
        `TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      // 2. Альтернативный способ (если TRUNCATE не подходит)
      await this.dataSource.query('SET CONSTRAINTS ALL DEFERRED'); // Откладываем проверку FK
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.query(`DELETE FROM "${entity.tableName}";`);
      }
    }
  }
}
