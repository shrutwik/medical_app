import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import SystemCard from '../components/cards/SystemCard';
import StudyScreenScroll from '../components/layout/StudyScreenScroll';
import { FadeInBlock, StaggerIn } from '../components/motion/StaggerIn';
import { colors, layout, shadows, typography } from '../constants/theme';
import { useBreadcrumbs } from '../contexts/BreadcrumbContext';
import { useResponsive } from '../hooks/useResponsive';
import { getContentRepository } from '../services/content/repository';
import { calculateCompletion, getMilestoneKeys, getProgressRepository } from '../services/progress/repository';
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

          return { system, conditions, progress, casesCount: cases.length };
        }),
      );

      setState({ systems: nextSystems, snapshot });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

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
    ? 'Continue studying'
    : featuredSystem
      ? `Begin ${featuredSystem.system.name}`
      : 'Pick a track to begin';
  const primaryCtaAction = () => {
    if (resumeActivity) { router.push(`/case/${resumeActivity.caseId}`); return; }
    if (featuredSystem) { router.push(`/system/${featuredSystem.system.id}`); }
  };

  const streak = state?.snapshot.streak.current ?? 0;
  const bookmarks = state?.snapshot.bookmarks.length ?? 0;

  // ── Hero card ──────────────────────────────────────────────────────────────
  const heroCard = (
    <FadeInBlock delayMs={0} durationMs={420}>
      <View style={[styles.heroCard, shadows.card]}>
        {/* Accent stripe */}
        <View style={styles.heroStripe} />

        <View style={styles.heroBody}>
          <Text style={styles.heroEyebrow}>Medical Study Hub</Text>
          <Text style={styles.heroTitle}>
            {resumeActivity ? `Welcome back.` : 'Start learning.'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {resumeActivity
              ? `Pick up where you left off — every case builds your clinical reasoning.`
              : 'Choose a study track, work through cases, and test your knowledge as you go.'}
          </Text>

          {/* Resume/start card */}
          {resumeActivity ? (
            <View style={styles.resumeCard}>
              <View style={styles.resumeDot} />
              <View style={styles.resumeText}>
                <Text style={styles.resumeLabel}>Last studied</Text>
                <Text style={styles.resumeTitle}>{resumeActivity.title}</Text>
                <Text style={styles.resumeDetail}>{resumeActivity.detail}</Text>
              </View>
            </View>
          ) : featuredSystem ? (
            <View style={[styles.resumeCard, styles.suggestCard]}>
              <Text style={styles.resumeLabel}>Suggested start</Text>
              <Text style={styles.resumeTitle}>{featuredSystem.system.name}</Text>
              <Text style={styles.resumeDetail}>
                {featuredSystem.conditions.length} condition{featuredSystem.conditions.length !== 1 ? 's' : ''} · {featuredSystem.casesCount} case{featuredSystem.casesCount !== 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.heroCta,
              !canPrimaryCta && styles.heroCtaDisabled,
              pressed && styles.heroCtaPressed,
            ]}
            onPress={primaryCtaAction}
            disabled={!canPrimaryCta}
          >
            <Text style={styles.heroCtaText}>{primaryCtaLabel} →</Text>
          </Pressable>
        </View>
      </View>
    </FadeInBlock>
  );

  // ── Stat cards ─────────────────────────────────────────────────────────────
  const statsBlock = (
    <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
      <StaggerIn index={0}>
        <View style={[styles.statCard, shadows.subtle, isDesktop && styles.statCardDesktop]}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
          <Text style={styles.statEmoji}>{streak > 0 ? '🔥' : '—'}</Text>
        </View>
      </StaggerIn>
      <StaggerIn index={1}>
        <View style={[styles.statCard, shadows.subtle, isDesktop && styles.statCardDesktop]}>
          <Text style={styles.statValue}>{completedCases}</Text>
          <Text style={styles.statLabel}>Cases touched</Text>
          <Text style={styles.statEmoji}>📖</Text>
        </View>
      </StaggerIn>
      <StaggerIn index={2}>
        <View style={[styles.statCard, shadows.subtle, isDesktop && styles.statCardDesktop]}>
          <Text style={styles.statValue}>{bookmarks}</Text>
          <Text style={styles.statLabel}>Bookmarked</Text>
          <Text style={styles.statEmoji}>★</Text>
        </View>
      </StaggerIn>
    </View>
  );

  // ── Tracks list ────────────────────────────────────────────────────────────
  const tracksHeader = (
    <FadeInBlock delayMs={80} durationMs={380}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Study tracks</Text>
        <Text style={styles.sectionSubtitle}>
          Each track covers a system in depth — from basic science to clinical application.
        </Text>
      </View>
    </FadeInBlock>
  );

  const tracksBody = (
    <>
      {loading ? (
        <View style={styles.loadingRow}>
          <View style={styles.loadingPulse} />
          <View style={[styles.loadingPulse, { opacity: 0.6 }]} />
          <View style={[styles.loadingPulse, { opacity: 0.3 }]} />
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn't load tracks</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadDashboard}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
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
              {heroCard}
              {statsBlock}
            </View>
            <View style={styles.desktopAside}>
              {tracksHeader}
              {tracksBody}
            </View>
          </View>
        ) : (
          <>
            {heroCard}
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
  // ── Desktop grid
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: layout.pagePaddingDesktop,
  },
  desktopMain: {
    flex: 1,
    minWidth: 320,
    maxWidth: 540,
  },
  desktopAside: {
    flex: 1.2,
    minWidth: 300,
  },

  // ── Hero card
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radius2xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroStripe: {
    height: 4,
    backgroundColor: colors.maroon,
  },
  heroBody: {
    padding: 28,
  },
  heroEyebrow: {
    ...typography.label,
    color: colors.maroon,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.6,
    marginBottom: 10,
    lineHeight: 40,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 22,
    maxWidth: 480,
  },
  resumeCard: {
    backgroundColor: colors.cloud,
    borderRadius: layout.radiusLg,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  resumeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.maroon,
    marginTop: 5,
    flexShrink: 0,
  },
  suggestCard: {
    flexDirection: 'column',
    gap: 0,
  },
  resumeText: {
    flex: 1,
  },
  resumeLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 5,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.2,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  resumeDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  heroCta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
  },
  heroCtaDisabled: { opacity: 0.4 },
  heroCtaPressed: { opacity: 0.85 },
  heroCtaText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.1,
  },

  // ── Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statsRowDesktop: {
    flexDirection: 'column',
    marginBottom: 0,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  statCardDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.cloud,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statEmoji: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    fontSize: 22,
    opacity: 0.35,
  },

  // ── Section header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.section,
    color: colors.maroonDeep,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 560,
  },
  systemList: {
    marginTop: 4,
  },

  // ── Loading skeleton
  loadingRow: {
    gap: 10,
    marginBottom: 8,
  },
  loadingPulse: {
    height: 80,
    borderRadius: layout.radiusLg,
    backgroundColor: colors.cloudDark,
    marginBottom: 2,
  },

  // ── Error
  errorCard: {
    backgroundColor: colors.errorBg,
    borderRadius: layout.radiusLg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
