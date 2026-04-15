import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Condition } from '../../types/condition';
import { colors, layout, shadows } from '../../constants/theme';
import { CardChevron, CardProgressTrack, cardPressableBase } from './cardShared';

interface ConditionCardProps {
  condition: Condition;
  onPress: () => void;
  progress?: number;
  meta?: string;
}

export default function ConditionCard({ condition, onPress, meta, progress }: ConditionCardProps) {
  const done = typeof progress === 'number' && progress >= 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open condition ${condition.name}`}
    >
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{condition.name}</Text>
          {done ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>✓</Text>
            </View>
          ) : null}
        </View>
        {condition.summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {condition.summary}
          </Text>
        ) : null}
        {meta ? (
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{meta}</Text>
            </View>
          </View>
        ) : null}
        <CardProgressTrack progress={progress} />
      </View>
      <CardChevron />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.radiusLg,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.1,
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  doneText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  metaPill: {
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
