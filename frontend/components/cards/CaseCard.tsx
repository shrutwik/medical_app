import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { Case } from '../../types/case';
import { colors, shadows } from '../../constants/theme';
import { CardChevron, CardProgressTrack, cardPressableBase } from './cardShared';

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
  progress?: number;
  publishStatus?: string;
}

export default function CaseCard({ caseItem, onPress, progress, publishStatus }: CaseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open case ${caseItem.title}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{caseItem.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{caseItem.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.description}>{caseItem.shortDescription}</Text>
        <CardProgressTrack progress={progress} />
        <View style={styles.footer}>
          {publishStatus ? (
            <View style={styles.publishBadge}>
              <Text style={styles.publishText}>{publishStatus}</Text>
            </View>
          ) : null}
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.maroonDeep,
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
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
    gap: 10,
  },
  publishBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldFaint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  publishText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
