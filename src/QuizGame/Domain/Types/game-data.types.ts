import { QuizQuestion } from '../quiz-question.entity';
import { QuizAnswer } from '../quiz-answer.entity';
import { QuizPair } from '../quiz-pair.entity';

export type GameDataType = {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  pair: QuizPair;
};
