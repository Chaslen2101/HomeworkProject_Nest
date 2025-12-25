import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(
    @Inject(QuizQuestionRepository)
    private questionRepository: QuizQuestionRepository,
  ) {}
  async execute(dto: DeleteQuestionCommand) {
    return await this.questionRepository.deleteQuestion(dto.id);
  }
}
