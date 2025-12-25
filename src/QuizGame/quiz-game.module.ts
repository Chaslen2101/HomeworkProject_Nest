import { Module } from '@nestjs/common';
import { QuizGameController } from './Api/quiz-game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizPairTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/quiz-pair-typeorm.entity';
import { QuizAnswerTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/quiz-answer-typeorm.entity';
import { QuizPairRepository } from './Infrastructure/Data-access/Sql/Repositories/quiz-pair.repository';
import { ConnectionQuizGameUseCase } from './Application/UseCases/connection.usecase';
import { QuizQuestionTypeormEntity } from './Infrastructure/Data-access/Sql/Entities/quiz-question-typeorm.entity';
import { CreateNewQuestionUseCase } from './Application/UseCases/create-new-question.usecase';
import { QuizQuestionRepository } from './Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';
import { DeleteQuestionUseCase } from './Application/UseCases/delete-question.usecase';
import { QuizQuestionQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/quiz-question.query-repository';
import { UpdateQuestionUseCase } from './Application/UseCases/update-question.usecase';
import { UpdateQuestionPublishStatusUseCase } from './Application/UseCases/update-question-publish-status.usecase';
import { QuizGameSaController } from './Api/quiz-game.sa.controller';
import { QuizPairQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/quiz-pair.query-repository';
import { UserTypeormEntity } from '../UserAccounts/Infrastructure/Data-access/Sql/Entities/user.typeorm-entity';
import { QuizAnswerRepository } from './Infrastructure/Data-access/Sql/Repositories/quiz-answer.repository';
import { SetAnswerForQuestionUseCase } from './Application/UseCases/set-answer-for-question.usecase';
import { QuizAnswerQueryRepository } from './Infrastructure/Data-access/Sql/Query-repositories/quiz-answer.query-repository';

const useCases = [
  ConnectionQuizGameUseCase,
  CreateNewQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
  UpdateQuestionPublishStatusUseCase,
  SetAnswerForQuestionUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizPairTypeormEntity,
      QuizAnswerTypeormEntity,
      QuizQuestionTypeormEntity,
      UserTypeormEntity,
    ]),
  ],
  controllers: [QuizGameController, QuizGameSaController],
  providers: [
    QuizPairRepository,
    QuizPairQueryRepository,
    QuizQuestionRepository,
    QuizQuestionQueryRepository,
    QuizAnswerRepository,
    QuizAnswerQueryRepository,

    ...useCases,
  ],
  exports: [],
})
export class QuizGameModule {}
