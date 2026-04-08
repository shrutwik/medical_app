import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, layout, shadows, typography } from '../../constants/theme';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { hasFirebaseConfig, isAdminDemoEnabled } from '../../services/auth/firebase';

interface DesktopAppShellProps {
  children: ReactNode;
}

export default function DesktopAppShell({ children }: DesktopAppShellProps) {
  const router = useRouter();
  const { segments } = useBreadcrumbs();
  const showAdminLink = isAdminDemoEnabled() || hasFirebaseConfig();

  return (
    <View style={styles.root}>
      <View style={styles.accentStrip} accessibilityElementsHidden />
      <View style={[styles.topBar, shadows.shell]}>
        <Pressable onPress={() => router.push('/')} style={styles.brandRow} accessibilityRole="link">
          <Text style={styles.brandKicker}>Study</Text>
          <Text style={styles.brandTitle}>Medical Study Hub</Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={() => router.push('/')} style={styles.navPill} accessibilityRole="link">
            <Text style={styles.navPillText}>Home</Text>
          </Pressable>
          {showAdminLink ? (
            <Pressable onPress={() => router.push('/admin')} style={styles.navPillMuted} accessibilityRole="link">
              <Text style={styles.navPillMutedText}>Admin</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {segments.length > 0 ? (
        <View style={styles.crumbRow}>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const canNavigate = Boolean(segment.href) && !isLast;
            return (
              <View key={`${segment.label}_${index}`} style={styles.crumbItem}>
                {index > 0 ? <Text style={styles.crumbSep}>·</Text> : null}
                {canNavigate && segment.href ? (
                  <Pressable onPress={() => router.push(segment.href!)}>
                    <Text style={styles.crumbLink}>{segment.label}</Text>
                  </Pressable>
                ) : (
                  <Text style={[styles.crumbText, isLast && styles.crumbCurrent]}>{segment.label}</Text>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  accentStrip: {
    height: layout.shellAccentHeight,
    backgroundColor: colors.maroon,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.pagePaddingDesktop,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexShrink: 1,
  },
  brandKicker: {
    ...typography.label,
    color: colors.maroon,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.3,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.maroon,
  },
  navPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  navPillMuted: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.cloud,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navPillMutedText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.maroonDeep,
  },
  crumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: layout.pagePaddingDesktop,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 6,
  },
  crumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crumbSep: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  crumbText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  crumbCurrent: {
    color: colors.maroonDeep,
    fontWeight: '800',
  },
  crumbLink: {
    fontSize: 13,
    color: colors.maroon,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
});
