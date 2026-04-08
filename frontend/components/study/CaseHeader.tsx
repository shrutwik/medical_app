import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AdminCase } from '../../services/content/repository';
import { colors } from '../../constants/theme';
import BackLink from '../navigation/BackLink';

interface CaseHeaderProps {
  caseItem: AdminCase;
  bookmarked: boolean;
  nextLabel?: string;
  onToggleBookmark: () => void;
  onBack?: () => void;
  backLabel?: string;
  /** Jump to the parent study track (system). */
  onTrack?: () => void;
  trackLabel?: string;
}

export default function CaseHeader({
  caseItem,
  bookmarked,
  nextLabel,
  onToggleBookmark,
  onBack,
  backLabel = 'Cases',
  onTrack,
  trackLabel = 'Track',
}: CaseHeaderProps) {
  return (
    <View style={styles.shell}>
      <View style={styles.topRow}>
        <View style={styles.leftCluster}>
          {onBack ? <BackLink label={backLabel} onPress={onBack} /> : <View />}
          {onTrack ? (
            <Pressable onPress={onTrack} style={styles.trackLink} accessibilityRole="link">
              <Text style={styles.trackLinkText}>{trackLabel}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.bookmarkButton} onPress={onToggleBookmark}>
          <Text style={styles.bookmarkText}>{bookmarked ? 'Saved' : 'Save'}</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{caseItem.title}</Text>
      <Text style={styles.description}>{caseItem.shortDescription}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Difficulty</Text>
          <Text style={styles.metaValue}>{caseItem.difficulty}</Text>
        </View>
        <View style={styles.metaCardWide}>
          <Text style={styles.metaLabel}>Next</Text>
          <Text style={styles.nextText}>{nextLabel ?? 'Follow the next section below.'}</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
    flexWrap: 'wrap',
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    flex: 1,
  },
  trackLink: {
    paddingVertical: 4,
  },
  trackLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.maroon,
    textDecorationLine: 'underline',
  },
  bookmarkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.cloud,
    borderWidth: 1,
    borderColor: colors.cardBgStrong,
  },
  bookmarkText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.maroonDeep,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    maxWidth: 900,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaCard: {
    width: 150,
    borderRadius: 16,
    backgroundColor: colors.cloud,
    padding: 14,
  },
  metaCardWide: {
    flex: 1,
    minWidth: 220,
    borderRadius: 16,
    backgroundColor: colors.cloud,
    padding: 14,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  nextText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
