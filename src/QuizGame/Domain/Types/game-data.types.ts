import { QuizQuestion } from '../quiz-question.entity';
import { QuizAnswer } from '../quiz-answer.entity';

export type GameDataType = {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  pairId: string;
};
