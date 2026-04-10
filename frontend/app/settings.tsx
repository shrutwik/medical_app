import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import StudyScreenScroll from '../components/layout/StudyScreenScroll';
import { FadeInBlock } from '../components/motion/StaggerIn';
import { colors, layout, typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useBreadcrumbs } from '../contexts/BreadcrumbContext';
import { getProgressRepository } from '../services/progress/repository';
import type { ProgressSnapshot } from '../types/study';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, guestMode, signOut } = useAuth();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', href: '/' }, { label: 'Settings' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const loadStats = useCallback(async () => {
    const snap = await getProgressRepository().getSnapshot();
    setSnapshot(snap);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } finally {
      setSigningOut(false);
    }
  };

  const casesTouched = snapshot
    ? Object.values(snapshot.cases).filter(
        (c) => c.completedSections.length > 0 || c.quizAttempts.length > 0,
      ).length
    : 0;

  const quizAttempts = snapshot
    ? Object.values(snapshot.cases).reduce((sum, c) => sum + c.quizAttempts.length, 0)
    : 0;

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <StudyScreenScroll>
        <FadeInBlock delayMs={0} durationMs={380}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account</Text>
            <View style={styles.card}>
              <Text style={styles.accountMode}>
                {guestMode ? 'Guest mode' : 'Signed in'}
              </Text>
              <Text style={styles.accountEmail}>
                {user?.email ?? (guestMode ? 'Progress saved locally on this device.' : '—')}
              </Text>
              <Pressable
                style={[styles.signOutButton, signingOut && styles.signOutButtonDisabled]}
                onPress={handleSignOut}
                disabled={signingOut}
              >
                <Text style={styles.signOutText}>
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </Text>
              </Pressable>
            </View>
          </View>
        </FadeInBlock>

        <FadeInBlock delayMs={80} durationMs={380}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{snapshot?.streak.current ?? 0}</Text>
                <Text style={styles.statLabel}>Day streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{snapshot?.streak.totalStudyDays ?? 0}</Text>
                <Text style={styles.statLabel}>Total days studied</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{casesTouched}</Text>
                <Text style={styles.statLabel}>Cases touched</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{quizAttempts}</Text>
                <Text style={styles.statLabel}>Quiz attempts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{snapshot?.bookmarks.length ?? 0}</Text>
                <Text style={styles.statLabel}>Bookmarks</Text>
              </View>
            </View>
          </View>
        </FadeInBlock>
      </StudyScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusXl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountMode: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.maroon,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  accountEmail: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.maroonDeep,
    marginBottom: 20,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  signOutButtonDisabled: {
    opacity: 0.45,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 120,
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
