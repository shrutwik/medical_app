import type { Bookmark, CaseProgress, ProgressSnapshot, QuizAttempt, RecentActivity } from '../../types/study';
import type { CaseBundle } from '../content/repository';
import { getStoredJson, setStoredJson } from '../storage/keyValueStore';

const STORAGE_KEY = 'medical-app/progress/v1';

const EMPTY_PROGRESS: ProgressSnapshot = {
  cases: {},
  bookmarks: [],
  recentActivity: [],
  streak: {
    current: 0,
    totalStudyDays: 0,
  },
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildCaseProgress(caseId: string): CaseProgress {
  return {
    caseId,
    activeTab: 'overview',
    completedSections: [],
    quizAttempts: [],
    markedQuestionIds: [],
  };
}

function buildRecentActivity(
  caseId: string,
  title: string,
  kind: RecentActivity['kind'],
  detail: string,
): RecentActivity {
  return {
    id: `${caseId}_${kind}_${Date.now()}`,
    caseId,
    title,
    kind,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function dedupeById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function updateStreak(snapshot: ProgressSnapshot) {
  const today = getTodayKey();
  const { lastStudyDate } = snapshot.streak;

  if (lastStudyDate === today) return;

  const previous = lastStudyDate ? new Date(lastStudyDate) : undefined;
  const current = new Date(today);
  const diffDays =
    previous === undefined
      ? undefined
      : Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

  snapshot.streak = {
    current: diffDays === 1 ? snapshot.streak.current + 1 : 1,
    totalStudyDays: snapshot.streak.totalStudyDays + 1,
    lastStudyDate: today,
  };
}

async function withSnapshot(
  mutator: (snapshot: ProgressSnapshot) => void | ProgressSnapshot,
): Promise<ProgressSnapshot> {
  const snapshot = await getStoredJson(STORAGE_KEY, EMPTY_PROGRESS);
  const result = mutator(snapshot);
  const next = (result ?? snapshot) as ProgressSnapshot;
  await setStoredJson(STORAGE_KEY, next);
  return next;
}

export function getMilestoneKeys(bundle: CaseBundle) {
  const keys = ['overview'];
  if (bundle.details) keys.push('clinical', 'diagnosis', 'treatment');
  for (const section of bundle.sections) {
    const key = `section_${section.type}`;
    if (!keys.includes(key)) keys.push(key);
  }
  if (bundle.mechanisms.length > 0) keys.push('mechanisms');
  if (bundle.resources.length > 0) keys.push('resources');
  if (bundle.quizzes.length > 0) keys.push('quiz');
  return keys;
}

export function calculateCompletion(
  progress: CaseProgress | undefined,
  requiredKeys: string[],
) {
  if (requiredKeys.length === 0) return 0;
  const completed = new Set(progress?.completedSections.map((section) => section.key) ?? []);
  const total = requiredKeys.filter((key) => completed.has(key)).length;
  return Math.round((total / requiredKeys.length) * 100);
}

export class LocalProgressRepository {
  async getSnapshot(): Promise<ProgressSnapshot> {
    return getStoredJson(STORAGE_KEY, EMPTY_PROGRESS);
  }

  async getCaseProgress(caseId: string): Promise<CaseProgress> {
    const snapshot = await this.getSnapshot();
    return snapshot.cases[caseId] ?? buildCaseProgress(caseId);
  }

  async touchCase(caseId: string, title: string, detail = 'Opened case'): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      updateStreak(snapshot);
      const current = snapshot.cases[caseId] ?? buildCaseProgress(caseId);
      current.lastVisitedAt = new Date().toISOString();
      snapshot.cases[caseId] = current;
      snapshot.recentActivity = dedupeById([
        buildRecentActivity(caseId, title, 'visit', detail),
        ...snapshot.recentActivity,
      ]).slice(0, 8);
    });
  }

  async setActiveTab(caseId: string, activeTab: string): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      const current = snapshot.cases[caseId] ?? buildCaseProgress(caseId);
      current.activeTab = activeTab;
      current.lastVisitedAt = new Date().toISOString();
      snapshot.cases[caseId] = current;
    });
  }

  async markSectionComplete(
    caseId: string,
    key: string,
    title: string,
    detail: string,
  ): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      updateStreak(snapshot);
      const current = snapshot.cases[caseId] ?? buildCaseProgress(caseId);
      current.lastVisitedAt = new Date().toISOString();
      const existing = current.completedSections.find((section) => section.key === key);
      if (!existing) {
        current.completedSections.push({
          key,
          completedAt: new Date().toISOString(),
        });
      }
      snapshot.cases[caseId] = current;
      snapshot.recentActivity = [
        buildRecentActivity(caseId, title, 'section', detail),
        ...snapshot.recentActivity,
      ].slice(0, 8);
    });
  }

  async recordQuizAttempt(
    attempt: Omit<QuizAttempt, 'createdAt'>,
    title: string,
  ): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      updateStreak(snapshot);
      const current = snapshot.cases[attempt.caseId] ?? buildCaseProgress(attempt.caseId);
      current.quizAttempts = [
        ...current.quizAttempts.filter((item) => item.questionId !== attempt.questionId),
        {
          ...attempt,
          createdAt: new Date().toISOString(),
        },
      ];
      current.lastVisitedAt = new Date().toISOString();
      snapshot.cases[attempt.caseId] = current;
      snapshot.recentActivity = [
        buildRecentActivity(
          attempt.caseId,
          title,
          'quiz',
          attempt.correct ? 'Answered a quiz item correctly' : 'Reviewed a quiz answer',
        ),
        ...snapshot.recentActivity,
      ].slice(0, 8);
    });
  }

  async toggleMarkedQuestion(caseId: string, questionId: string): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      const current = snapshot.cases[caseId] ?? buildCaseProgress(caseId);
      const next = new Set(current.markedQuestionIds);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      current.markedQuestionIds = [...next];
      snapshot.cases[caseId] = current;
    });
  }

  async toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<ProgressSnapshot> {
    return withSnapshot((snapshot) => {
      const existing = snapshot.bookmarks.find(
        (item) => item.entityType === bookmark.entityType && item.entityId === bookmark.entityId,
      );

      if (existing) {
        snapshot.bookmarks = snapshot.bookmarks.filter((item) => item.id !== existing.id);
        return;
      }

      snapshot.bookmarks = [
        {
          ...bookmark,
          id: `${bookmark.entityType}_${bookmark.entityId}`,
          createdAt: new Date().toISOString(),
        },
        ...snapshot.bookmarks,
      ];
    });
  }
}

let repository: LocalProgressRepository | undefined;

export function getProgressRepository() {
  if (!repository) {
    repository = new LocalProgressRepository();
  }

  return repository;
}
