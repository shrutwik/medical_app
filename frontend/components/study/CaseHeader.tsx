import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AdminCase } from '../../services/content/repository';
import { colors, layout } from '../../constants/theme';
import BackLink from '../navigation/BackLink';

interface CaseHeaderProps {
  caseItem: AdminCase;
  bookmarked: boolean;
  nextLabel?: string;
  onToggleBookmark: () => void;
  onBack?: () => void;
  backLabel?: string;
  onTrack?: () => void;
  trackLabel?: string;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: 'Foundational', color: colors.success,  bg: colors.successBg },
  medium: { label: 'Intermediate', color: colors.gold,     bg: colors.goldFaint },
  hard:   { label: 'Advanced',     color: colors.maroon,   bg: colors.maroonFaint },
};

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
  const [collapsed, setCollapsed] = useState(false);
  const diff = DIFFICULTY_CONFIG[caseItem.difficulty?.toLowerCase() ?? ''] ?? {
    label: caseItem.difficulty,
    color: colors.textMuted,
    bg: colors.cloud,
  };

  return (
    <View style={[styles.shell, collapsed && styles.shellCollapsed]}>
      {/* Top navigation row */}
      {!collapsed ? (
        <View style={styles.topRow}>
          <View style={styles.breadcrumb}>
            {onBack ? <BackLink label={backLabel} onPress={onBack} /> : null}
            {onTrack ? (
              <>
                <Text style={styles.breadcrumbSep}>·</Text>
                <Pressable onPress={onTrack} accessibilityRole="link">
                  <Text style={styles.breadcrumbLink}>{trackLabel}</Text>
                </Pressable>
              </>
            ) : null}
          </View>
          <Pressable
            style={[styles.bookmarkButton, bookmarked && styles.bookmarkButtonActive]}
            onPress={onToggleBookmark}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark this case'}
          >
            <Text style={[styles.bookmarkIcon, bookmarked && styles.bookmarkIconActive]}>
              {bookmarked ? '★' : '☆'}
            </Text>
            <Text style={[styles.bookmarkText, bookmarked && styles.bookmarkTextActive]}>
              {bookmarked ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Title block */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, collapsed && styles.titleCollapsed]}>{caseItem.title}</Text>
        <Pressable
          style={styles.collapseButton}
          onPress={() => setCollapsed((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Expand case header' : 'Collapse case header'}
        >
          <Text style={styles.collapseButtonText}>{collapsed ? 'Show details' : 'Hide details'}</Text>
        </Pressable>
      </View>
      {!collapsed ? <Text style={styles.description}>{caseItem.shortDescription}</Text> : null}

      {/* Meta chips */}
      {!collapsed ? (
        <View style={styles.metaRow}>
          <View style={[styles.chip, { backgroundColor: diff.bg }]}>
            <View style={[styles.chipDot, { backgroundColor: diff.color }]} />
            <Text style={[styles.chipText, { color: diff.color }]}>{diff.label}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.white,
    paddingHorizontal: layout.pagePadding,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shellCollapsed: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  breadcrumbSep: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  breadcrumbLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.maroon,
  },
  bookmarkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.cloud,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkButtonActive: {
    backgroundColor: colors.goldFaint,
    borderColor: '#F2D0A5',
  },
  bookmarkIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bookmarkIconActive: {
    color: colors.gold,
  },
  bookmarkText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  bookmarkTextActive: {
    color: colors.goldDeep,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  collapseButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.cloud,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  collapseButtonText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.4,
    marginBottom: 8,
    flex: 1,
  },
  titleCollapsed: {
    marginBottom: 0,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    maxWidth: 840,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
