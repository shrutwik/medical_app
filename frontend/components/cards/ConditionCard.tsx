import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Condition } from '../../types/condition';
import { colors } from '../../constants/theme';

interface ConditionCardProps {
  condition: Condition;
  onPress: () => void;
}

export default function ConditionCard({ condition, onPress }: ConditionCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{condition.name}</Text>
        {condition.summary ? (
          <Text style={styles.summary} numberOfLines={2}>
            {condition.summary}
          </Text>
        ) : null}
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  summary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: colors.textMuted,
  },
});
