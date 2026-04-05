import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { QuizQuestion } from '../../types/quiz';
import { colors } from '../../constants/theme';

interface QuizRendererProps {
  questions: QuizQuestion[];
}

export default function QuizRenderer({ questions }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return null;

  const q = questions[currentIndex];
  const isCorrect = selectedIndex === q.answerIndex;

  const handleSelect = (index: number) => {
    if (!submitted) setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex !== null) setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedIndex(null);
      setSubmitted(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <Text style={styles.progress}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
      </View>

      <Text style={styles.question}>{q.question}</Text>

      {q.options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const showCorrect = submitted && index === q.answerIndex;
        const showWrong = submitted && isSelected && !isCorrect;

        return (
          <Pressable
            key={index}
            style={[
              styles.option,
              isSelected && !submitted && styles.optionSelected,
              showCorrect && styles.optionCorrect,
              showWrong && styles.optionWrong,
            ]}
            onPress={() => handleSelect(index)}
          >
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.radio,
                  isSelected && !submitted && styles.radioSelected,
                  showCorrect && styles.radioCorrect,
                  showWrong && styles.radioWrong,
                ]}
              />
              <Text style={styles.optionText}>{option}</Text>
            </View>
          </Pressable>
        );
      })}

      {!submitted ? (
        <Pressable
          style={[styles.button, selectedIndex === null && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={selectedIndex === null}
        >
          <Text style={styles.buttonText}>Submit Answer</Text>
        </Pressable>
      ) : (
        <View>
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={[styles.feedbackTitle, isCorrect ? styles.textCorrect : styles.textWrong]}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            <Text style={styles.explanation}>{q.explanation}</Text>
          </View>
          {currentIndex < questions.length - 1 && (
            <Pressable style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next Question</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  progressBar: {
    backgroundColor: colors.maroonFaint,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  progress: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.maroon,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  option: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.white,
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
  },
  radioSelected: {
    borderColor: colors.maroon,
    backgroundColor: colors.maroon,
  },
  radioCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  radioWrong: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.maroon,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  feedback: {
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  feedbackCorrect: {
    backgroundColor: colors.successBg,
  },
  feedbackWrong: {
    backgroundColor: colors.errorBg,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  textCorrect: {
    color: colors.success,
  },
  textWrong: {
    color: colors.error,
  },
  explanation: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
