import { Controller, Delete } from '@nestjs/common';
import mongoose from 'mongoose';

@Controller('testing')
export class TestingController {
  @Delete('all-data')
  async deleteAllData(): Promise<void> {
    await mongoose.connection.dropDatabase();
    return;
  }
}
