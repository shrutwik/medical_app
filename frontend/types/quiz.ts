export interface QuizQuestion {
  id: string;
  caseId: string;
  sectionType: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  tags: string[];
}
