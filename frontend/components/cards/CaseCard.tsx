import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Case } from '../../types/case';
import { colors, layout, shadows } from '../../constants/theme';
import { CardChevron, CardProgressTrack, cardPressableBase } from './cardShared';

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  easy:     { bg: colors.successBg,  text: colors.success, label: 'Foundational' },
  medium:   { bg: colors.goldFaint,  text: colors.gold,    label: 'Intermediate' },
  hard:     { bg: colors.maroonFaint, text: colors.maroon, label: 'Advanced' },
};

function getDifficultyStyle(difficulty: string) {
  return DIFFICULTY_STYLE[difficulty.toLowerCase()] ?? { bg: colors.cloud, text: colors.textMuted, label: difficulty };
}

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
  progress?: number;
  publishStatus?: string;
}

export default function CaseCard({ caseItem, onPress, progress, publishStatus }: CaseCardProps) {
  const diff = getDifficultyStyle(caseItem.difficulty);
  const started = typeof progress === 'number' && progress > 0;
  const done = typeof progress === 'number' && progress >= 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open case ${caseItem.title}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{caseItem.title}</Text>
          <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
            <Text style={[styles.diffText, { color: diff.text }]}>{diff.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {caseItem.shortDescription}
        </Text>

        <View style={styles.footer}>
          {done ? (
            <View style={styles.completeBadge}>
              <Text style={styles.completeText}>✓ Completed</Text>
            </View>
          ) : started ? (
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>In progress</Text>
            </View>
          ) : null}
          {publishStatus ? (
            <View style={styles.publishBadge}>
              <Text style={styles.publishText}>{publishStatus}</Text>
            </View>
          ) : null}
        </View>

        <CardProgressTrack progress={progress} />
      </View>
      <CardChevron />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.radiusLg,
    alignItems: 'flex-start',
  },
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.1,
    lineHeight: 24,
    minWidth: 120,
  },
  diffBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  completeBadge: {
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  completeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  inProgressBadge: {
    backgroundColor: colors.maroonFaint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inProgressText: {
    color: colors.maroon,
    fontSize: 11,
    fontWeight: '700',
  },
  publishBadge: {
    backgroundColor: colors.goldFaint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  publishText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
