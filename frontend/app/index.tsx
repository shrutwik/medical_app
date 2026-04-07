import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import SystemCard from '../components/cards/SystemCard';
import { colors } from '../constants/theme';
import { useResponsive } from '../hooks/useResponsive';
import { getContentRepository, type CaseBundle } from '../services/content/repository';
import { calculateCompletion, getProgressRepository } from '../services/progress/repository';
import type { Condition } from '../types/condition';
import type { System } from '../types/system';
import type { ProgressSnapshot } from '../types/study';

interface DashboardSystem {
  system: System;
  conditions: Condition[];
  progress: number;
  casesCount: number;
}

interface DashboardState {
  systems: DashboardSystem[];
  snapshot: ProgressSnapshot;
}

function getMilestoneKeys(bundle: CaseBundle) {
  const keys = ['overview'];
  if (bundle.details) keys.push('clinical', 'diagnosis', 'treatment');
  for (const section of bundle.sections) {
    const key = `section_${section.type}`;
    if (!keys.includes(key)) keys.push(key);
  }
  if (bundle.mechanisms.length > 0) keys.push('mechanisms');
  if (bundle.resources.length > 0) keys.push('resources');
  if (bundle.quizzes.length > 0) keys.push('quiz');
  return keys;
}

export default function Index() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [state, setState] = useState<DashboardState>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const contentRepo = getContentRepository();
      const progressRepo = getProgressRepository();
      const systems = await contentRepo.getSystems();
      const snapshot = await progressRepo.getSnapshot();

      const nextSystems = await Promise.all(
        systems.map(async (system) => {
          const conditions = await contentRepo.getConditionsBySystem(system.id);
          const cases = (
            await Promise.all(
              conditions.map((condition) => contentRepo.getCasesByCondition(condition.id)),
            )
          ).flat();

          const bundles = await Promise.all(cases.map((caseItem) => contentRepo.getCaseBundle(caseItem.id)));
          const completions = bundles.map((bundle) =>
            calculateCompletion(snapshot.cases[bundle.caseItem?.id ?? ''], getMilestoneKeys(bundle)),
          );
          const progress =
            completions.length > 0
              ? Math.round(completions.reduce((sum, value) => sum + value, 0) / completions.length)
              : 0;

          return {
            system,
            conditions,
            progress,
            casesCount: cases.length,
          };
        }),
      );

      setState({
        systems: nextSystems,
        snapshot,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const resumeActivity = state?.snapshot.recentActivity[0];
  const completedCases = useMemo(() => {
    if (!state) return 0;
    return Object.values(state.snapshot.cases).filter(
      (item) => item.completedSections.length > 0 || item.quizAttempts.length > 0,
    ).length;
  }, [state]);
  const featuredSystem = state?.systems[0];
  const primaryCtaLabel = resumeActivity
    ? 'Continue where you left off'
    : featuredSystem
      ? `Start ${featuredSystem.system.name}`
      : 'Begin studying';
  const primaryCtaAction = () => {
    if (resumeActivity) {
      router.push(`/case/${resumeActivity.caseId}`);
      return;
    }
    if (featuredSystem) {
      router.push(`/system/${featuredSystem.system.id}`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Medical Study Hub' }} />
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Medical Study Hub</Text>
          <Text style={styles.heroTitle}>Study with one clear next step.</Text>
          <Text style={styles.heroText}>
            Start with a track, move into a condition, then work through one case at a time.
          </Text>

          {resumeActivity ? (
            <View style={styles.resumeCard}>
              <Text style={styles.resumeLabel}>Continue</Text>
              <Text style={styles.resumeTitle}>{resumeActivity.title}</Text>
              <Text style={styles.resumeText}>{resumeActivity.detail}</Text>
            </View>
          ) : (
            <View style={styles.resumeCard}>
              <Text style={styles.resumeLabel}>Recommended start</Text>
              <Text style={styles.resumeTitle}>
                {featuredSystem ? featuredSystem.system.name : 'Respiratory'}
              </Text>
              <Text style={styles.resumeText}>Open the track and begin the first case flow.</Text>
            </View>
          )}

          <Pressable style={styles.primaryButton} onPress={primaryCtaAction}>
            <Text style={styles.primaryButtonText}>{primaryCtaLabel}</Text>
          </Pressable>
        </View>

        <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>
              {state?.snapshot.streak.current ?? 0} day{(state?.snapshot.streak.current ?? 0) === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saved</Text>
            <Text style={styles.statValue}>{state?.snapshot.bookmarks.length ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Cases</Text>
            <Text style={styles.statValue}>{completedCases}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Study Tracks</Text>
          <Text style={styles.sectionSubtitle}>Choose a track to begin.</Text>
        </View>

        {loading ? <Text style={styles.statusText}>Loading study tracks...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.systemList}>
          {state?.systems.map((item) => (
            <SystemCard
              key={item.system.id}
              system={item.system}
              progress={item.progress}
              meta={`${item.conditions.length} condition${item.conditions.length === 1 ? '' : 's'} • ${item.casesCount} case${item.casesCount === 1 ? '' : 's'}`}
              onPress={() => router.push(`/system/${item.system.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  pageContent: {
    padding: 20,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.maroon,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  heroTitle: {
    color: colors.maroonDeep,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 12,
    maxWidth: 760,
  },
  heroText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 720,
    marginBottom: 18,
  },
  resumeCard: {
    backgroundColor: colors.cloud,
    borderRadius: 22,
    padding: 20,
    maxWidth: 620,
    marginBottom: 16,
  },
  resumeLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  resumeTitle: {
    color: colors.maroonDeep,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  resumeText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    gap: 12,
    marginBottom: 24,
  },
  statsRowDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.maroonDeep,
    fontSize: 28,
    fontWeight: '800',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.maroonDeep,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  systemList: {
    marginTop: 8,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingVertical: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    paddingVertical: 12,
  },
});
