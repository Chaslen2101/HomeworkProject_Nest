import { Module } from '@nestjs/common';
import { TestingController } from './Api/testing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentTypeormEntity } from '../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/comment.typeorm-entity';
import { PostTypeormEntity } from '../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/post.typeorm-entity';
import { BlogTypeormEntity } from '../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/blog.typeorm-entity';
import { LikeStatusTypeormEntity } from '../BloggersPlatform/Infrastructure/Data-access/Sql/Entities/likeStatus.typeorm-entity';
import { UserTypeormEntity } from '../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { EmailConfirmInfoTypeormEntity } from '../UserAccounts/Infrastructure/Data-access/Sql/Entities/emailConfirmInfo.typeorm-entity';
import { PasswordRecoveryInfoTypeormEntity } from '../UserAccounts/Infrastructure/Data-access/Sql/Entities/passwordRecoveryInfo.typeorm-entity';
import { SessionTypeormEntity } from '../UserAccounts/Infrastructure/Data-access/Sql/Entities/session.typeorm-entity';
import { QuizPairTypeormEntity } from '../QuizGame/Infrastructure/Data-access/Sql/Entities/quiz-pair-typeorm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentTypeormEntity,
      PostTypeormEntity,
      BlogTypeormEntity,
      LikeStatusTypeormEntity,
      UserTypeormEntity,
      EmailConfirmInfoTypeormEntity,
      PasswordRecoveryInfoTypeormEntity,
      SessionTypeormEntity,
      QuizPairTypeormEntity,
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
