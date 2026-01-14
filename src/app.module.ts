import dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { CoreModule } from './Core/core.module';
import { UserAccountsModule } from './UserAccounts/user-account.module';
import { BloggersPlatformModule } from './BloggersPlatform/bloggers-platform.module';
import { TestingModule } from './Testing/testing.module';
import { QuizGameModule } from './QuizGame/quiz-game.module';

@Module({
  imports: [
    // MongooseModule.forRoot(process.env.MONGO_URL!),
    // MongooseModule.forFeature([{ name: Comment.name, schema: CommentEntity }]),
    CoreModule,
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
    QuizGameModule,
  ],
})
export class AppModule {}
