import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { StudyCheckpoint } from '../../types/checkpoint';
import { colors, layout } from '../../constants/theme';

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
    <View style={[styles.card, completed && styles.cardDone]}>
      {/* Header strip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.kicker}>Active Recall</Text>
          <Text style={styles.title}>{checkpoint.title}</Text>
        </View>
        {completed ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ Done</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Reflect</Text>
          </View>
        )}
      </View>

      {/* Prompt */}
      <View style={styles.promptBlock}>
        <Text style={styles.promptLabel}>Consider this question</Text>
        <Text style={styles.prompt}>{checkpoint.prompt}</Text>
      </View>

      {/* Hint */}
      <View style={styles.hintBox}>
        <Text style={styles.hintLabel}>Hint</Text>
        <Text style={styles.hintText}>{checkpoint.hint}</Text>
      </View>

      {/* Revealed coaching note */}
      {revealed ? (
        <Animated.View entering={FadeIn.duration(280)} exiting={FadeOut.duration(200)} style={styles.answerBox}>
          <View style={styles.answerHeader}>
            <View style={styles.answerDot} />
            <Text style={styles.answerLabel}>Coaching Note</Text>
          </View>
          <Text style={styles.answerText}>{checkpoint.answer}</Text>
        </Animated.View>
      ) : null}

      {/* CTA */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.revealButton,
            completed && !revealed && styles.revealButtonDone,
            revealed && styles.revealButtonHide,
            pressed && styles.revealButtonPressed,
          ]}
          onPress={toggleReveal}
        >
          <Text style={[
            styles.revealText,
            completed && !revealed && styles.revealTextDone,
            revealed && styles.revealTextHide,
          ]}>
            {revealed
              ? 'Hide coaching note'
              : completed
              ? '★ Show coaching note again'
              : 'Reveal coaching note'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.goldFaint,
    borderRadius: layout.radiusLg,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0C98A',
    overflow: 'hidden',
  },
  cardDone: {
    borderColor: '#D4B87A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    paddingBottom: 14,
    gap: 12,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
  },
  kicker: {
    color: colors.goldDeep,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 5,
  },
  title: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  completedBadge: {
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.successBorder,
    flexShrink: 0,
  },
  completedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  pendingBadge: {
    backgroundColor: 'rgba(192,112,48,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  pendingBadgeText: {
    color: colors.goldDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  promptBlock: {
    marginHorizontal: 18,
    marginBottom: 12,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldDeep,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  prompt: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
  hintBox: {
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: layout.radiusMd,
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(192,112,48,0.15)',
  },
  hintLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  answerBox: {
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.white,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  answerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.maroon,
  },
  answerLabel: {
    color: colors.maroon,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  answerText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  actions: {
    padding: 18,
    paddingTop: 4,
  },
  revealButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  revealButtonDone: {
    backgroundColor: 'rgba(192,112,48,0.15)',
  },
  revealButtonHide: {
    backgroundColor: colors.cloud,
  },
  revealButtonPressed: {
    opacity: 0.8,
  },
  revealText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  revealTextDone: {
    color: colors.goldDeep,
  },
  revealTextHide: {
    color: colors.textSecondary,
  },
});
