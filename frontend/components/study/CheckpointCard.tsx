import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StudyCheckpoint } from '../../types/checkpoint';
import { colors } from '../../constants/theme';

interface CheckpointCardProps {
  checkpoint: StudyCheckpoint;
  completed: boolean;
  onComplete: () => void;
}

export default function CheckpointCard({
  checkpoint,
  completed,
  onComplete,
}: CheckpointCardProps) {
  const [revealed, setRevealed] = useState(false);

  const toggleReveal = () => {
    const next = !revealed;
    setRevealed(next);
    if (next && !completed) {
      onComplete();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Active Recall Checkpoint</Text>
      <Text style={styles.title}>{checkpoint.title}</Text>
      <Text style={styles.prompt}>{checkpoint.prompt}</Text>

      <View style={styles.hintBox}>
        <Text style={styles.hintLabel}>Hint</Text>
        <Text style={styles.hintText}>{checkpoint.hint}</Text>
      </View>

      {revealed ? (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>Coaching Note</Text>
          <Text style={styles.answerText}>{checkpoint.answer}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, completed && styles.primaryButtonDone]}
          onPress={toggleReveal}
        >
          <Text style={[styles.primaryText, completed && styles.primaryTextDone]}>
            {revealed ? 'Hide coaching note' : completed ? 'Saved note' : 'Reveal coaching note'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.goldFaint,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F2D0A5',
  },
  kicker: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  prompt: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  hintBox: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 14,
    marginBottom: 12,
  },
  hintLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  answerBox: {
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 12,
  },
  answerLabel: {
    color: colors.maroon,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  answerText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonDone: {
    backgroundColor: colors.successBg,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryTextDone: {
    color: colors.success,
  },
});
