import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import ConditionCard from '../../components/cards/ConditionCard';
import BackLink from '../../components/navigation/BackLink';
import { colors } from '../../constants/theme';
import { getContentRepository, type CaseBundle } from '../../services/content/repository';
import { calculateCompletion, getProgressRepository } from '../../services/progress/repository';
import type { Condition } from '../../types/condition';

interface ConditionRow {
  condition: Condition;
  progress: number;
  casesCount: number;
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

export default function SystemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('Study Track');
  const [rows, setRows] = useState<ConditionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightedCondition = rows[0];
  const totalCases = useMemo(
    () => rows.reduce((sum, row) => sum + row.casesCount, 0),
    [rows],
  );
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
    const contentRepo = getContentRepository();
    const progressRepo = getProgressRepository();
    const systems = await contentRepo.getSystems();
    const conditions = await contentRepo.getConditionsBySystem(id);
    const snapshot = await progressRepo.getSnapshot();

    const nextRows = await Promise.all(
      conditions.map(async (condition) => {
        const cases = await contentRepo.getCasesByCondition(condition.id);
        const bundles = await Promise.all(cases.map((item) => contentRepo.getCaseBundle(item.id)));
        const completions = bundles.map((bundle) =>
          calculateCompletion(snapshot.cases[bundle.caseItem?.id ?? ''], getMilestoneKeys(bundle)),
        );
        const progress =
          completions.length > 0
            ? Math.round(completions.reduce((sum, value) => sum + value, 0) / completions.length)
            : 0;

        return {
          condition,
          progress,
          casesCount: cases.length,
        };
      }),
    );

    setRows(nextRows);
    setTitle(systems.find((system) => system.id === id)?.name ?? 'Study Track');
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <BackLink label="Tracks" onPress={() => router.push('/')} />
          <Text style={styles.eyebrow}>Track</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>Choose a condition, then move into the next case.</Text>
          {highlightedCondition ? (
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push(`/condition/${highlightedCondition.condition.id}`)}
            >
              <Text style={styles.primaryButtonText}>
                Continue with {highlightedCondition.condition.name}
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Conditions</Text>
              <Text style={styles.metaValue}>{rows.length}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Cases</Text>
              <Text style={styles.metaValue}>{totalCases}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Progress</Text>
              <Text style={styles.metaValue}>{averageProgress}%</Text>
            </View>
          </View>
        </View>

        {loading ? <Text style={styles.statusText}>Loading conditions...</Text> : null}

        <View style={styles.list}>
          {rows.map((row) => (
            <ConditionCard
              key={row.condition.id}
              condition={row.condition}
              progress={row.progress}
              meta={`${row.casesCount} case${row.casesCount === 1 ? '' : 's'} · ${row.condition.learningGoals.length} learning goals`}
              onPress={() => router.push(`/condition/${row.condition.id}`)}
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
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
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
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
  list: {
    marginTop: 4,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingBottom: 16,
  },
});
