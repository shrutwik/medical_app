import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import type { QuizQuestion } from '../../types/quiz';
import type { QuizAttempt } from '../../types/study';
import { colors, layout } from '../../constants/theme';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const FOUNDATION_CASE_ID = 'asthma_foundation_case';
const FOUNDATION_SESSION_SIZE = 10;

interface QuizPanelProps {
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  onAttempt: (question: QuizQuestion, selectedIndex: number, correct: boolean) => Promise<void>;
  onCompleteQuiz: () => Promise<void>;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const tmp = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = tmp;
  }
  return next;
}

function pickFoundationSession(
  questions: QuizQuestion[],
  completedIds: Set<string>,
): QuizQuestion[] {
  const unseen = questions.filter((item) => !completedIds.has(item.id));
  if (unseen.length >= FOUNDATION_SESSION_SIZE) {
    return shuffle(unseen).slice(0, FOUNDATION_SESSION_SIZE);
  }
  if (unseen.length > 0) {
    const filler = shuffle(questions.filter((item) => completedIds.has(item.id))).slice(
      0,
      FOUNDATION_SESSION_SIZE - unseen.length,
    );
    return [...shuffle(unseen), ...filler];
  }
  return shuffle(questions).slice(0, FOUNDATION_SESSION_SIZE);
}

export default function QuizPanel({
  questions,
  attempts,
  onAttempt,
  onCompleteQuiz,
}: QuizPanelProps) {
  const isFoundationMode =
    questions.length > FOUNDATION_SESSION_SIZE && questions.some((item) => item.caseId === FOUNDATION_CASE_ID);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[]>([]);
  const [sessionAttemptMap, setSessionAttemptMap] = useState<Record<string, number>>({});

  const historicalAttemptMap = useMemo(
    () => new Map(attempts.map((attempt) => [attempt.questionId, attempt.selectedIndex])),
    [attempts],
  );
  const completedQuestionIds = useMemo(
    () => new Set(attempts.map((attempt) => attempt.questionId)),
    [attempts],
  );
  const foundationSessionQuestions = useMemo(() => {
    if (!isFoundationMode) return questions;
    if (sessionQuestionIds.length === 0) {
      return pickFoundationSession(questions, completedQuestionIds);
    }
    const byId = new Map(questions.map((item) => [item.id, item]));
    const mapped = sessionQuestionIds.map((id) => byId.get(id)).filter(Boolean) as QuizQuestion[];
    if (mapped.length === sessionQuestionIds.length) return mapped;
    return pickFoundationSession(questions, completedQuestionIds);
  }, [completedQuestionIds, isFoundationMode, questions, sessionQuestionIds]);
  const visibleQuestions = isFoundationMode ? foundationSessionQuestions : questions;
  const attemptMap = useMemo(() => {
    if (!isFoundationMode) {
      return new Map(attempts.map((attempt) => [attempt.questionId, attempt.selectedIndex]));
    }
    return new Map(Object.entries(sessionAttemptMap));
  }, [attempts, isFoundationMode, sessionAttemptMap]);
  useEffect(() => {
    if (!isFoundationMode) return;
    if (sessionQuestionIds.length > 0) return;
    const nextSet = pickFoundationSession(questions, completedQuestionIds);
    setSessionQuestionIds(nextSet.map((item) => item.id));
  }, [completedQuestionIds, isFoundationMode, questions, sessionQuestionIds.length]);

  // Reset submitted state when moving to a new question
  const question = visibleQuestions[currentIndex];
  const previousAttempt = question ? attemptMap.get(question.id) : undefined;
  const isAnswered = previousAttempt !== undefined;
  const effectiveSelectedIndex = isAnswered ? previousAttempt : selectedIndex;
  const isCorrect = effectiveSelectedIndex === question?.answerIndex;

  if (visibleQuestions.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No quiz items yet</Text>
        <Text style={styles.emptyText}>
          Add questions in the admin workspace to turn this case into a longer study session.
        </Text>
      </View>
    );
  }

  const answeredCount = visibleQuestions.filter((item) => attemptMap.has(item.id)).length;

  const startNextFoundationSession = () => {
    if (!isFoundationMode) return;
    const nextSet = pickFoundationSession(questions, completedQuestionIds);
    setSessionQuestionIds(nextSet.map((item) => item.id));
    setSessionAttemptMap({});
    setCurrentIndex(0);
    setSelectedIndex(null);
  };

  const handleSubmit = async () => {
    if (selectedIndex === null) return;
    const correct = selectedIndex === question.answerIndex;
    if (isFoundationMode && question) {
      setSessionAttemptMap((prev) => ({ ...prev, [question.id]: selectedIndex }));
    }
    await onAttempt(question, selectedIndex, correct);
    if (answeredCount + 1 === visibleQuestions.length && !isFoundationMode) {
      await onCompleteQuiz();
    }
  };

  const handleNext = () => {
    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
    }
  };

  return (
    <View style={styles.shell}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.eyebrow}>Practice Questions</Text>
          <Text style={styles.headerTitle}>
            Question {currentIndex + 1} <Text style={styles.headerOf}>of {visibleQuestions.length}</Text>
          </Text>
        </View>
      </View>

      {/* Question */}
      <Animated.View key={question.id} entering={FadeIn.duration(240)} style={styles.questionCard}>
        <Text style={styles.question}>{question.question}</Text>

        <View style={styles.optionsWrap}>
          {question.options.map((option, index) => {
            const selected = effectiveSelectedIndex === index;
            const showCorrect = isAnswered && index === question.answerIndex;
            const showWrong = isAnswered && selected && !isCorrect;
            const letter = OPTION_LETTERS[index] ?? String(index + 1);

            return (
              <Pressable
                key={`${question.id}_${index}`}
                onPress={() => !isAnswered && setSelectedIndex(index)}
                style={({ pressed }) => [
                  styles.option,
                  selected && !isAnswered && styles.optionSelected,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                  !isAnswered && pressed && styles.optionPressed,
                ]}
              >
                <View style={[
                  styles.optionLetter,
                  selected && !isAnswered && styles.optionLetterSelected,
                  showCorrect && styles.optionLetterCorrect,
                  showWrong && styles.optionLetterWrong,
                ]}>
                  <Text style={[
                    styles.optionLetterText,
                    (selected && !isAnswered) || showCorrect || showWrong ? styles.optionLetterTextActive : null,
                  ]}>
                    {showCorrect ? '✓' : showWrong ? '✗' : letter}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  showCorrect && styles.optionTextCorrect,
                  showWrong && styles.optionTextWrong,
                ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Submit or feedback */}
        {!isAnswered ? (
          <Pressable
            style={[styles.submitButton, selectedIndex === null && styles.submitButtonDisabled]}
            disabled={selectedIndex === null}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>Submit Answer</Text>
          </Pressable>
        ) : (
          <Animated.View entering={FadeInUp.duration(320)} style={[styles.feedbackBox, isCorrect ? styles.feedbackBoxCorrect : styles.feedbackBoxWrong]}>
            <View style={styles.feedbackHeader}>
              <View style={[styles.feedbackIcon, isCorrect ? styles.feedbackIconCorrect : styles.feedbackIconWrong]}>
                <Text style={styles.feedbackIconText}>{isCorrect ? '✓' : '✗'}</Text>
              </View>
              <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                {isCorrect ? 'That\'s right!' : 'Not quite — here\'s why'}
              </Text>
            </View>
            <Text style={styles.feedbackText}>{question.explanation}</Text>
            {currentIndex < visibleQuestions.length - 1 ? (
              <Pressable style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextText}>Next question →</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.nextButton}
                onPress={async () => {
                  if (isFoundationMode) {
                    await onCompleteQuiz();
                    startNextFoundationSession();
                    return;
                  }
                  await onCompleteQuiz();
                }}
              >
                <Text style={styles.nextText}>
                  {isFoundationMode ? 'Start next 10 →' : 'Finish quiz ✓'}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </Animated.View>

      {/* Question nav dots */}
      {visibleQuestions.length > 1 ? (
        <View style={styles.dotsRow}>
          {visibleQuestions.map((q, index) => {
            const attempt = attemptMap.get(q.id);
            const isCurrent = index === currentIndex;
            return (
              <Pressable
                key={q.id}
                onPress={() => { setCurrentIndex(index); setSelectedIndex(null); }}
                style={[
                  styles.dot,
                  isCurrent && styles.dotActive,
                  attempt === q.answerIndex && !isCurrent && styles.dotCorrect,
                  attempt !== undefined && attempt !== q.answerIndex && !isCurrent && styles.dotWrong,
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 14,
  },
  header: {
    backgroundColor: colors.maroonDeep,
    borderRadius: layout.radiusLg,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
  },
  eyebrow: {
    color: colors.goldBright,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerOf: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 20,
  },
  optionsWrap: {
    gap: 10,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: layout.radiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    backgroundColor: colors.offWhite,
  },
  optionSelected: {
    borderColor: colors.maroon,
    backgroundColor: colors.maroonFaint,
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  optionWrong: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cloud,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionLetterSelected: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  optionLetterCorrect: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  optionLetterWrong: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  optionLetterTextActive: {
    color: colors.white,
  },
  optionText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 4,
  },
  optionTextCorrect: {
    color: colors.success,
    fontWeight: '600',
  },
  optionTextWrong: {
    color: colors.error,
  },
  submitButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  submitButtonDisabled: {
    opacity: 0.35,
  },
  submitText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackBox: {
    borderRadius: layout.radiusMd,
    padding: 18,
    borderWidth: 1,
  },
  feedbackBoxCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  feedbackBoxWrong: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  feedbackIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackIconCorrect: {
    backgroundColor: colors.success,
  },
  feedbackIconWrong: {
    backgroundColor: colors.error,
  },
  feedbackIconText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  feedbackTitleCorrect: {
    color: colors.success,
  },
  feedbackTitleWrong: {
    color: colors.error,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  nextButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroonDeep,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  nextText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    backgroundColor: colors.maroon,
    width: 24,
    borderRadius: 5,
  },
  dotCorrect: {
    backgroundColor: colors.success,
  },
  dotWrong: {
    backgroundColor: colors.error,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.maroonDeep,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
