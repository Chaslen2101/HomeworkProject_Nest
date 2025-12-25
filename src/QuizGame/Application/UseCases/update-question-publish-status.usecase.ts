import { QuizQuestionRepository } from '../../Infrastructure/Data-access/Sql/Repositories/quiz-question.repository';
import { UpdatePublishStatusDTO } from '../../Api/InputDTOValidator/question-dto.validator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

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
  async execute(dto: UpdateQuestionPublishStatusCommand): Promise<boolean> {
    const result: boolean = await this.questionRepository.updatePublishStatus(
      dto.updatePublishStatusDTO.published,
      dto.id,
    );
    return result;
  }
}
