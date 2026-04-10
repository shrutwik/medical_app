import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import CaseCard from '../../components/cards/CaseCard';
import StudyScreenScroll from '../../components/layout/StudyScreenScroll';
import { FadeInBlock, StaggerIn } from '../../components/motion/StaggerIn';
import BackLink from '../../components/navigation/BackLink';
import { colors, layout, shadows } from '../../constants/theme';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { getContentRepository, type AdminCase } from '../../services/content/repository';
import { calculateCompletion, getMilestoneKeys, getProgressRepository } from '../../services/progress/repository';
import type { Condition } from '../../types/condition';

interface CaseRow {
  caseItem: AdminCase;
  progress: number;
}

export default function ConditionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [condition, setCondition] = useState<Condition>();
  const [trackMeta, setTrackMeta] = useState<{ systemId: string; systemName: string }>();
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const nextCase = rows.find((row) => row.progress < 100) ?? rows[0];
  const averageProgress = useMemo(
    () =>
      rows.length > 0
        ? Math.round(rows.reduce((sum, row) => sum + row.progress, 0) / rows.length)
        : 0,
    [rows],
  );

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setTrackMeta(undefined);
    const contentRepo = getContentRepository();
    const progressRepo = getProgressRepository();
    const [nextCondition, cases, snapshot, systems] = await Promise.all([
      contentRepo.getConditionById(id),
      contentRepo.getCasesByCondition(id),
      progressRepo.getSnapshot(),
      contentRepo.getSystems(),
    ]);

    const parentSystem = systems.find((system) => system.id === nextCondition?.systemId);
    setTrackMeta(
      parentSystem && nextCondition
        ? { systemId: parentSystem.id, systemName: parentSystem.name }
        : undefined,
    );

    const bundles = await Promise.all(cases.map((item) => contentRepo.getCaseBundle(item.id)));
    const nextRows = cases.map((caseItem, index) => ({
      caseItem,
      progress: calculateCompletion(snapshot.cases[caseItem.id], getMilestoneKeys(bundles[index])),
    }));

    setCondition(nextCondition);
    setRows(nextRows);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id || !condition || !trackMeta) {
      setBreadcrumbs([]);
      return;
    }
    setBreadcrumbs([
      { label: 'Home', href: '/' },
      { label: trackMeta.systemName, href: `/system/${trackMeta.systemId}` },
      { label: condition.name },
    ]);
    return () => setBreadcrumbs([]);
  }, [id, condition, trackMeta, setBreadcrumbs]);

  return (
    <>
      <Stack.Screen options={{ title: condition?.name ?? 'Condition' }} />
      <StudyScreenScroll key={id}>
        <FadeInBlock delayMs={0} durationMs={400}>
          <View style={[styles.heroCard, shadows.card]}>
          <BackLink
            label="Track"
            onPress={() => router.push(condition ? `/system/${condition.systemId}` : '/')}
          />
          <Text style={styles.eyebrow}>Condition</Text>
          <Text style={styles.title}>{condition?.name ?? 'Loading...'}</Text>
          <Text style={styles.description} numberOfLines={3}>
            {condition?.summary}
          </Text>
          {nextCase ? (
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push(`/case/${nextCase.caseItem.id}`)}
            >
              <Text style={styles.primaryButtonText}>
                {nextCase.progress > 0 ? 'Resume case' : 'Start case'}
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Cases</Text>
              <Text style={styles.metaValue}>{rows.length}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Progress</Text>
              <Text style={styles.metaValue}>{averageProgress}%</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Goals</Text>
              <Text style={styles.metaValue}>{condition?.learningGoals.length ?? 0}</Text>
            </View>
          </View>
          {(condition?.learningGoals.length ?? 0) > 0 ? (
            <View style={styles.focusBlock}>
              <Text style={styles.focusTitle}>Focus</Text>
              {condition?.learningGoals.slice(0, 3).map((goal) => (
                <Text key={goal} style={styles.focusItem}>
                  {`\u2022 ${goal}`}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
        </FadeInBlock>

        <FadeInBlock delayMs={80} durationMs={360}>
          <Text style={styles.sectionTitle}>Cases</Text>
        </FadeInBlock>
        {loading ? <Text style={styles.statusText}>Loading cases...</Text> : null}

        <View style={styles.list}>
          {rows.map((row, index) => (
            <StaggerIn key={row.caseItem.id} index={index}>
              <CaseCard
                caseItem={row.caseItem}
                progress={row.progress}
                onPress={() => router.push(`/case/${row.caseItem.id}`)}
              />
            </StaggerIn>
          ))}
        </View>
      </StudyScreenScroll>
    </>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.maroon,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  title: {
    color: colors.maroonDeep,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  metaCard: {
    minWidth: 120,
    backgroundColor: colors.cloud,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metaValue: {
    color: colors.maroonDeep,
    fontSize: 22,
    fontWeight: '800',
  },
  focusBlock: {
    backgroundColor: colors.cloud,
    borderRadius: 18,
    padding: 16,
  },
  focusTitle: {
    color: colors.maroonDeep,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  focusItem: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.maroonDeep,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingBottom: 12,
  },
  list: {
    marginTop: 4,
  },
});
