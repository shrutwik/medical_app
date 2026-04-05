import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Case } from '../../types/case';
import { colors } from '../../constants/theme';

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
}

export default function CaseCard({ caseItem, onPress }: CaseCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{caseItem.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{caseItem.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.description}>{caseItem.shortDescription}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.maroonFaint,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    color: colors.maroon,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
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
