import { AnswerStatusEnum } from '../../Domain/Types/answer.types';

export type QuizQuestionViewType = {
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
  items: QuizQuestionViewType[];
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
  questions:
    | {
        id: string;
        body: string;
      }[]
    | null;
  status: string;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
};
