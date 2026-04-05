import quizzesData from '../../mock/quizzes.json';
import { QuizQuestion } from '../../types/quiz';

export function getQuizzesByCase(caseId: string): QuizQuestion[] {
  return (quizzesData as QuizQuestion[]).filter((q) => q.caseId === caseId);
}
