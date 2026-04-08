import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Condition } from '../../types/condition';
import { colors, shadows } from '../../constants/theme';
import { CardChevron, CardProgressTrack, cardPressableBase } from './cardShared';

interface ConditionCardProps {
  condition: Condition;
  onPress: () => void;
  progress?: number;
  meta?: string;
}

export default function ConditionCard({ condition, onPress, meta, progress }: ConditionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open condition ${condition.name}`}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{condition.name}</Text>
        {condition.summary ? (
          <Text style={styles.summary} numberOfLines={3}>
            {condition.summary}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <CardProgressTrack progress={progress} />
      </View>
      <CardChevron />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    minWidth: 0,
  },
  pressed: { opacity: 0.94 },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.maroonDeep,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
    marginBottom: 10,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
