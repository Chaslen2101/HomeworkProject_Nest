import { CreateUpdateQuestionInputDTO } from '../../Api/InputDTOValidator/question-dto.validator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestion } from '../../Domain/quiz-question.entity';
import { Inject } from '@nestjs/common';
import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';
import { DomainException } from '../../../Common/Domain/Exceptions/domain-exceptions';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public updateQuestionDto: CreateUpdateQuestionInputDTO,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    @Inject(QuizQuestionRepository)
    private questionRepository: QuizQuestionRepository,
  ) {}

  async execute(dto: UpdateQuestionCommand): Promise<void> {
    const neededQuestion: QuizQuestion | null =
      await this.questionRepository.findById(dto.id);
    if (!neededQuestion) throw new DomainException('Not Found', 404);
    neededQuestion.updateBodyAnswers(dto.updateQuestionDto);
    await this.questionRepository.update(neededQuestion);
    return;
  }
}
