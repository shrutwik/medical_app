export type PublishStatus = 'draft' | 'published';

export interface QuizAttempt {
  caseId: string;
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  createdAt: string;
}

export interface SectionProgress {
  key: string;
  completedAt: string;
}

export interface Bookmark {
  id: string;
  entityType: 'case' | 'resource' | 'question';
  entityId: string;
  caseId: string;
  label: string;
  createdAt: string;
}

export interface RecentActivity {
  id: string;
  caseId: string;
  title: string;
  kind: 'visit' | 'section' | 'quiz';
  createdAt: string;
  detail: string;
}

export interface StreakState {
  current: number;
  totalStudyDays: number;
  lastStudyDate?: string;
}

export interface CaseProgress {
  caseId: string;
  activeTab: string;
  completedSections: SectionProgress[];
  quizAttempts: QuizAttempt[];
  markedQuestionIds: string[];
  lastVisitedAt?: string;
}

export interface ProgressSnapshot {
  cases: Record<string, CaseProgress>;
  bookmarks: Bookmark[];
  recentActivity: RecentActivity[];
  streak: StreakState;
}
