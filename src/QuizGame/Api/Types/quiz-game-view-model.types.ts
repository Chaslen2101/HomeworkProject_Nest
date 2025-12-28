import { AnswerStatusEnum } from '../../Domain/Types/answer-status.enum';
import { PairStatusEnum } from '../../Domain/Types/pair-status.enum';

export type QuizQuestionSAViewType = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};

export type QuestionPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuizQuestionSAViewType[];
};

export type QuizQuestionViewType = {
  id: string;
  body: string;
};

export type QuizAnswerViewType = {
  questionId: string;
  answerStatus: AnswerStatusEnum;
  addedAt: Date;
};

export type QuizPairViewType = {
  id: string;
  firstPlayerProgress: {
    answers: QuizAnswerViewType[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: QuizAnswerViewType[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  } | null;
  questions: QuizQuestionViewType[] | null;
  status: PairStatusEnum;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
};

export type QuizPairPagesType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuizPairViewType[];
};

export type QuizMyStatisticType = {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
};
