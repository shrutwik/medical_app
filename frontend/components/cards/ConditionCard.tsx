import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Condition } from '../../types/condition';
import { colors } from '../../constants/theme';

interface ConditionCardProps {
  condition: Condition;
  onPress: () => void;
  progress?: number;
  meta?: string;
}

export default function ConditionCard({ condition, onPress, progress, meta }: ConditionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{condition.name}</Text>
        {condition.summary ? (
          <Text style={styles.summary} numberOfLines={3}>
            {condition.summary}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {typeof progress === 'number' ? (
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.sideMeta}>
        <Text style={styles.sideMetaText}>Open</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
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
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.cardBg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.maroon,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sideMeta: {
    marginLeft: 14,
    alignSelf: 'flex-start',
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sideMetaText: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '700',
  },
});
