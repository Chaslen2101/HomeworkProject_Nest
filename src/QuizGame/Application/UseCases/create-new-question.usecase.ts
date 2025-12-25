import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUpdateQuestionInputDTO } from '../../Api/InputDTOValidator/question-dto.validator';
import { QuizQuestion } from '../../Domain/quiz-question.entity';
import { Inject } from '@nestjs/common';
import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';

export class CreateNewQuestionCommand {
  constructor(public newQuestionDTO: CreateUpdateQuestionInputDTO) {}
}

@CommandHandler(CreateNewQuestionCommand)
export class CreateNewQuestionUseCase
  implements ICommandHandler<CreateNewQuestionCommand>
{
  constructor(
    @Inject(QuizQuestionRepository)
    private questionRepository: QuizQuestionRepository,
  ) {}
  async execute(dto: CreateNewQuestionCommand) {
    const newQuestion: QuizQuestion = QuizQuestion.createNew(
      dto.newQuestionDTO,
    );
    await this.questionRepository.createNewQuestion(newQuestion);
    return newQuestion.id;
  }
}
