import { StyleSheet, Text, View } from 'react-native';
import type { RecentActivity } from '../../types/study';
import { colors } from '../../constants/theme';

interface ProgressRailProps {
  completion: number;
  completedCount: number;
  totalCount: number;
  bookmarkCount: number;
  markedCount: number;
  streak: number;
  nextLabel?: string;
  recentActivity: RecentActivity[];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function ProgressRail({
  completion,
  completedCount,
  totalCount,
  bookmarkCount,
  markedCount,
  streak,
  nextLabel,
  recentActivity: _recentActivity,
}: ProgressRailProps) {
  return (
    <View style={styles.rail}>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Progress</Text>
        <Text style={styles.heroValue}>{completion}% complete</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completion}%` }]} />
        </View>
        <Text style={styles.helper}>{completedCount} of {totalCount} sections done</Text>
        <View style={styles.statGrid}>
          <StatCard label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
          <StatCard label="Saved" value={bookmarkCount} />
          <StatCard label="Review" value={markedCount} />
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Up Next</Text>
        <Text style={styles.nextLabel}>{nextLabel ?? 'You are caught up on this case.'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: 14,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  heroValue: {
    color: colors.maroonDeep,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.cardBg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.maroon,
  },
  helper: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    backgroundColor: colors.cloud,
    borderRadius: 18,
    padding: 16,
    flex: 1,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  nextLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600',
  },
});
