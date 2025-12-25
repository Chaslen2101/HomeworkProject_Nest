import { CreateUpdateQuestionInputDTO } from '../Api/InputDTOValidator/question-dto.validator';
import { randomUUID } from 'node:crypto';

export class QuizQuestion {
  constructor(
    public id: string,
    public body: string,
    public answers: string[],
    public published: boolean,
    public createdAt: Date,
    public updatedAt: Date | null,
  ) {}

  static createNew(
    createQuestionDto: CreateUpdateQuestionInputDTO,
  ): QuizQuestion {
    return new this(
      randomUUID(),
      createQuestionDto.body,
      createQuestionDto.correctAnswers,
      false,
      new Date(),
      null,
    );
  }

  update(updateDto: CreateUpdateQuestionInputDTO): QuizQuestion {
    this.body = updateDto.body;
    this.answers = updateDto.correctAnswers;
    return this;
  }
}
