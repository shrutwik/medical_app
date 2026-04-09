import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import SystemCard from '../components/cards/SystemCard';
import StudyScreenScroll from '../components/layout/StudyScreenScroll';
import { FadeInBlock, StaggerIn } from '../components/motion/StaggerIn';
import { colors, layout, shadows, typography } from '../constants/theme';
import { useBreadcrumbs } from '../contexts/BreadcrumbContext';
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
  const { setBreadcrumbs } = useBreadcrumbs();
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

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home' }]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  const resumeActivity = state?.snapshot.recentActivity[0];
  const completedCases = useMemo(() => {
    if (!state) return 0;
    return Object.values(state.snapshot.cases).filter(
      (item) => item.completedSections.length > 0 || item.quizAttempts.length > 0,
    ).length;
  }, [state]);
  const featuredSystem = state?.systems[0];
  const canPrimaryCta = Boolean(resumeActivity || featuredSystem);
  const primaryCtaLabel = resumeActivity
    ? 'Continue where you left off'
    : featuredSystem
      ? `Start ${featuredSystem.system.name}`
      : 'Pick a track to begin';
  const primaryCtaAction = () => {
    if (resumeActivity) {
      router.push(`/case/${resumeActivity.caseId}`);
      return;
    }
    if (featuredSystem) {
      router.push(`/system/${featuredSystem.system.id}`);
    }
  };

  const heroBlock = (
    <FadeInBlock delayMs={0} durationMs={420}>
      <View style={[styles.heroCard, shadows.card]}>
      <Text style={styles.eyebrow}>Medical Study Hub</Text>
      <Text style={styles.heroTitle}>Study with one clear next step.</Text>
      <Text style={styles.heroText}>
        Choose a track, open a condition, then work through cases in order—or jump anywhere from the nav.
      </Text>

      {resumeActivity ? (
        <View style={styles.resumeCard}>
          <Text style={styles.resumeLabel}>Continue</Text>
          <Text style={styles.resumeTitle}>{resumeActivity.title}</Text>
          <Text style={styles.resumeText}>{resumeActivity.detail}</Text>
        </View>
      ) : (
        <View style={styles.resumeCard}>
          <Text style={styles.resumeLabel}>Suggested start</Text>
          <Text style={styles.resumeTitle}>
            {featuredSystem ? featuredSystem.system.name : 'Your tracks'}
          </Text>
          <Text style={styles.resumeText}>
            {featuredSystem
              ? 'Open this track and start or resume the next case.'
              : 'When tracks load, pick one from the list to begin.'}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, !canPrimaryCta && styles.primaryButtonDisabled]}
        onPress={primaryCtaAction}
        disabled={!canPrimaryCta}
      >
        <Text style={styles.primaryButtonText}>{primaryCtaLabel}</Text>
      </Pressable>
    </View>
    </FadeInBlock>
  );

  const statsBlock = (
    <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
      <StaggerIn index={0}>
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <Text style={[styles.statLabel, isDesktop && styles.statLabelDesktop]}>Streak</Text>
          <Text style={[styles.statValue, isDesktop && styles.statValueDesktop]}>
            {state?.snapshot.streak.current ?? 0} day{(state?.snapshot.streak.current ?? 0) === 1 ? '' : 's'}
          </Text>
        </View>
      </StaggerIn>
      <StaggerIn index={1}>
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <Text style={[styles.statLabel, isDesktop && styles.statLabelDesktop]}>Saved</Text>
          <Text style={[styles.statValue, isDesktop && styles.statValueDesktop]}>
            {state?.snapshot.bookmarks.length ?? 0}
          </Text>
        </View>
      </StaggerIn>
      <StaggerIn index={2}>
        <View style={[styles.statCard, isDesktop && styles.statCardDesktop]}>
          <Text style={[styles.statLabel, isDesktop && styles.statLabelDesktop]}>Cases touched</Text>
          <Text style={[styles.statValue, isDesktop && styles.statValueDesktop]}>{completedCases}</Text>
        </View>
      </StaggerIn>
    </View>
  );

  const tracksHeader = (
    <FadeInBlock delayMs={100} durationMs={380}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Study tracks</Text>
        <Text style={styles.sectionSubtitle}>Open a track to see conditions and cases.</Text>
      </View>
    </FadeInBlock>
  );

  const tracksBody = (
    <>
      {loading ? <Text style={styles.statusText}>Loading study tracks...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.systemList}>
        {state?.systems.map((item, index) => (
          <StaggerIn key={item.system.id} index={index}>
            <SystemCard
              system={item.system}
              progress={item.progress}
              meta={`${item.conditions.length} condition${item.conditions.length === 1 ? '' : 's'} · ${item.casesCount} case${item.casesCount === 1 ? '' : 's'}`}
              onPress={() => router.push(`/system/${item.system.id}`)}
            />
          </StaggerIn>
        ))}
      </View>
    </>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Medical Study Hub' }} />
      <StudyScreenScroll>
        {isDesktop ? (
          <View style={styles.desktopGrid}>
            <View style={styles.desktopMain}>
              {heroBlock}
              {statsBlock}
            </View>
            <View style={styles.desktopAside}>
              {tracksHeader}
              {tracksBody}
            </View>
          </View>
        ) : (
          <>
            {heroBlock}
            {statsBlock}
            {tracksHeader}
            {tracksBody}
          </>
        )}
      </StudyScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: layout.pagePaddingDesktop,
  },
  desktopMain: {
    flex: 1,
    minWidth: 300,
    maxWidth: 560,
  },
  desktopAside: {
    flex: 1,
    minWidth: 280,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusXl,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  eyebrow: {
    ...typography.label,
    color: colors.maroon,
    marginBottom: 10,
  },
  heroTitle: {
    color: colors.maroonDeep,
    ...typography.heroTitle,
    marginBottom: 12,
    maxWidth: 760,
  },
  heroText: {
    color: colors.textSecondary,
    ...typography.body,
    marginBottom: 18,
    maxWidth: 720,
  },
  resumeCard: {
    backgroundColor: colors.cloud,
    borderRadius: layout.radiusLg,
    padding: 20,
    maxWidth: 620,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    gap: 12,
    marginBottom: 24,
  },
  statsRowDesktop: {
    flexDirection: 'column',
    marginBottom: 0,
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  statCardDesktop: {
    backgroundColor: colors.cloud,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: layout.radiusMd,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statLabelDesktop: {
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    color: colors.maroonDeep,
    fontSize: 28,
    fontWeight: '800',
  },
  statValueDesktop: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 14,
    marginTop: 4,
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
