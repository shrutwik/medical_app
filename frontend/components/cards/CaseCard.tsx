import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Case } from '../../types/case';
import { colors } from '../../constants/theme';

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
  progress?: number;
  publishStatus?: string;
}

export default function CaseCard({
  caseItem,
  onPress,
  progress,
  publishStatus,
}: CaseCardProps) {
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
        <View style={styles.footer}>
          {typeof progress === 'number' ? (
            <View style={styles.progressRow}>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% complete</Text>
            </View>
          ) : null}
          {publishStatus ? (
            <View style={styles.publishBadge}>
              <Text style={styles.publishText}>{publishStatus}</Text>
            </View>
          ) : null}
        </View>
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
    marginTop: 12,
    gap: 10,
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
