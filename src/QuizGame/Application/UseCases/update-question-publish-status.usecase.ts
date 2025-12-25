import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';
import { UpdatePublishStatusDTO } from '../../Api/InputDTOValidator/question-dto.validator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizQuestion } from '../../Domain/quiz-question.entity';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';

export class UpdateQuestionPublishStatusCommand {
  constructor(
    public updatePublishStatusDTO: UpdatePublishStatusDTO,
    public id: string,
  ) {}
}

@CommandHandler(UpdateQuestionPublishStatusCommand)
export class UpdateQuestionPublishStatusUseCase
  implements ICommandHandler<UpdateQuestionPublishStatusCommand>
{
  constructor(
    @Inject(QuizQuestionRepository)
    private questionRepository: QuizQuestionRepository,
  ) {}
  async execute(dto: UpdateQuestionPublishStatusCommand): Promise<string> {
    const neededQuestion: QuizQuestion | null =
      await this.questionRepository.findById(dto.id);
    if (!neededQuestion) {
      throw new DomainException('Not Found', 404);
    }
    if (!neededQuestion.correctAnswers) {
      throw new DomainException('Question have no correct answers', 400);
    }
    neededQuestion.updatePublishStatus(dto.updatePublishStatusDTO.published);
    const result: string = await this.questionRepository.update(neededQuestion);
    return result;
  }
}
