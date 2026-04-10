import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import InfoCard from '../../components/cards/InfoCard';
import CaseVisualOverview from '../../components/study/CaseVisualOverview';
import ResourcePanel from '../../components/study/ResourcePanel';
import CaseHeader from '../../components/study/CaseHeader';
import CheckpointCard from '../../components/study/CheckpointCard';
import QuizPanel from '../../components/study/QuizPanel';
import SectionBlock from '../../components/study/SectionBlock';
import StudyNav, { type StudyNavItem } from '../../components/study/StudyNav';
import MechanismRenderer from '../../components/sections/MechanismRenderer';
import { FadeInBlock } from '../../components/motion/StaggerIn';
import { colors, layout } from '../../constants/theme';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getContentRepository, type AdminCase, type CaseBundle } from '../../services/content/repository';
import { getProgressRepository } from '../../services/progress/repository';
import type { QuizQuestion } from '../../types/quiz';
import type { Bookmark, ProgressSnapshot } from '../../types/study';
import type { Section, SectionType } from '../../types/section';

const SECTION_LABELS: Record<string, string> = {
  narrative: 'Narrative',
  histology: 'Histology',
  pathology: 'Pathology',
  physiology: 'Physiology',
  pharmacology: 'Pharmacology',
  mechanism: 'Mechanism',
  treatment: 'Treatment',
  clinicalPearl: 'Clinical Pearl',
};

export default function CaseDetailScreen() {
  const { id, preview } = useLocalSearchParams<{ id: string; preview?: string }>();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { setBreadcrumbs } = useBreadcrumbs();
  const includeDrafts = preview === '1';
  const [bundle, setBundle] = useState<CaseBundle>();
  const [snapshot, setSnapshot] = useState<ProgressSnapshot>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState('overview');
  const [parentNav, setParentNav] = useState<{
    systemId: string;
    systemName: string;
    conditionName: string;
  }>();
  const [siblingCases, setSiblingCases] = useState<AdminCase[]>([]);
  const touchedCaseId = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(undefined);
    setParentNav(undefined);
    setSiblingCases([]);

    try {
      const contentRepo = getContentRepository();
      const progressRepo = getProgressRepository();
      const [nextBundle, nextSnapshot] = await Promise.all([
        contentRepo.getCaseBundle(id, includeDrafts),
        progressRepo.getSnapshot(),
      ]);

      setBundle(nextBundle);
      setSnapshot(nextSnapshot);

      const savedTab = nextSnapshot.cases[id]?.activeTab;
      if (savedTab) {
        setActiveTab(savedTab);
      }

      if (nextBundle.caseItem) {
        const [condition, systems, siblings] = await Promise.all([
          contentRepo.getConditionById(nextBundle.caseItem.conditionId),
          contentRepo.getSystems(),
          contentRepo.getCasesByCondition(nextBundle.caseItem.conditionId, includeDrafts),
        ]);
        const system = systems.find((item) => item.id === condition?.systemId);
        if (condition && system) {
          setParentNav({
            systemId: system.id,
            systemName: system.name,
            conditionName: condition.name,
          });
        }
        setSiblingCases(siblings);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load case.');
    } finally {
      setLoading(false);
    }
  }, [id, includeDrafts]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const caseItem = bundle?.caseItem;
    if (!caseItem || touchedCaseId.current === caseItem.id) return;

    touchedCaseId.current = caseItem.id;
    getProgressRepository()
      .touchCase(caseItem.id, caseItem.title)
      .then((nextSnapshot) => setSnapshot(nextSnapshot));
  }, [bundle?.caseItem]);

  const caseProgress = snapshot && id ? snapshot.cases[id] : undefined;

  const sectionsByType = useMemo(() => {
    const map: Partial<Record<SectionType, NonNullable<CaseBundle['sections']>>> = {};
    for (const section of bundle?.sections ?? []) {
      if (!map[section.type]) map[section.type] = [];
      map[section.type]!.push(section);
    }
    return map;
  }, [bundle?.sections]);

  const completedSet = useMemo(
    () => new Set(caseProgress?.completedSections.map((item) => item.key) ?? []),
    [caseProgress?.completedSections],
  );
  const currentBookmarks = snapshot?.bookmarks.filter((item) => item.caseId === id) ?? [];

  const navItems = useMemo<StudyNavItem[]>(() => {
    const items: StudyNavItem[] = [{ key: 'overview', label: 'Overview', completed: completedSet.has('overview') }];
    if (bundle?.details) {
      items.push(
        { key: 'clinical', label: 'Clinical', completed: completedSet.has('clinical') },
        { key: 'diagnosis', label: 'Diagnosis', completed: completedSet.has('diagnosis') },
        { key: 'treatment', label: 'Treatment', completed: completedSet.has('treatment') },
      );
    }
    for (const type of Object.keys(sectionsByType) as SectionType[]) {
      const key = `section_${type}`;
      items.push({
        key,
        label: SECTION_LABELS[type] ?? type,
        completed: completedSet.has(key),
      });
    }
    if ((bundle?.mechanisms.length ?? 0) > 0) {
      items.push({ key: 'mechanisms', label: 'Mechanisms', completed: completedSet.has('mechanisms') });
    }
    if ((bundle?.resources.length ?? 0) > 0) {
      items.push({ key: 'resources', label: 'Resources', completed: completedSet.has('resources') });
    }
    if ((bundle?.quizzes.length ?? 0) > 0) {
      items.push({
        key: 'quiz',
        label: 'Quiz',
        badge: String(bundle?.quizzes.length ?? 0),
        accent: true,
        completed: completedSet.has('quiz'),
      });
    }
    return items;
  }, [bundle?.details, bundle?.mechanisms.length, bundle?.resources.length, bundle?.quizzes.length, completedSet, sectionsByType]);

  const nextMilestone = navItems.find((item) => !completedSet.has(item.key))?.label;
  const activeIndex = navItems.findIndex((item) => item.key === activeTab);
  const previousItem = activeIndex > 0 ? navItems[activeIndex - 1] : undefined;
  const nextItem = activeIndex >= 0 ? navItems[activeIndex + 1] : undefined;

  const sortedSiblings = useMemo(
    () => [...siblingCases].sort((a, b) => a.title.localeCompare(b.title)),
    [siblingCases],
  );

  const nextCaseInCondition = useMemo(() => {
    if (!id) return undefined;
    const idx = sortedSiblings.findIndex((item) => item.id === id);
    if (idx < 0 || idx >= sortedSiblings.length - 1) return undefined;
    return sortedSiblings[idx + 1];
  }, [id, sortedSiblings]);

  useEffect(() => {
    if (!id || !bundle?.caseItem || !parentNav || bundle.caseItem.id !== id) {
      setBreadcrumbs([]);
      return;
    }
    const conditionId = bundle.caseItem.conditionId;
    setBreadcrumbs([
      { label: 'Home', href: '/' },
      { label: parentNav.systemName, href: `/system/${parentNav.systemId}` },
      { label: parentNav.conditionName, href: `/condition/${conditionId}` },
      { label: bundle.caseItem.title },
    ]);
    return () => setBreadcrumbs([]);
  }, [id, bundle?.caseItem, parentNav, setBreadcrumbs]);

  useEffect(() => {
    if (!id || !bundle?.caseItem) return;
    if (activeTab === 'quiz') return;
    if (completedSet.has(activeTab)) return;

    let detail: string | undefined;
    if (activeTab === 'overview') detail = 'Started the case overview';
    if (activeTab === 'clinical') detail = 'Reviewed the clinical story';
    if (activeTab === 'diagnosis') detail = 'Worked through diagnosis framing';
    if (activeTab === 'treatment') detail = 'Reviewed the treatment plan';
    if (activeTab === 'mechanisms') detail = 'Opened the mechanism walkthrough';
    if (activeTab === 'resources') detail = 'Opened the study resources';
    if (activeTab.startsWith('section_')) {
      const label = SECTION_LABELS[activeTab.replace('section_', '')] ?? 'section';
      detail = `Reviewed ${label.toLowerCase()} notes`;
    }

    if (!detail) return;

    getProgressRepository()
      .markSectionComplete(id, activeTab, bundle.caseItem.title, detail)
      .then((nextSnapshot) => setSnapshot(nextSnapshot))
      .catch(() => undefined);
  }, [activeTab, bundle?.caseItem, completedSet, id]);

  const handleTabChange = async (key: string) => {
    if (!id) return;
    setActiveTab(key);
    const nextSnapshot = await getProgressRepository().setActiveTab(id, key);
    setSnapshot(nextSnapshot);
  };

  const markComplete = async (key: string, detail: string) => {
    if (!id || !bundle?.caseItem) return;
    const nextSnapshot = await getProgressRepository().markSectionComplete(
      id,
      key,
      bundle.caseItem.title,
      detail,
    );
    setSnapshot(nextSnapshot);
  };

  const toggleBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const nextSnapshot = await getProgressRepository().toggleBookmark(bookmark);
    setSnapshot(nextSnapshot);
  };

  const handleQuizAttempt = async (
    question: QuizQuestion,
    selectedIndex: number,
    correct: boolean,
  ) => {
    if (!bundle?.caseItem) return;
    const nextSnapshot = await getProgressRepository().recordQuizAttempt(
      {
        caseId: question.caseId,
        questionId: question.id,
        selectedIndex,
        correct,
      },
      bundle.caseItem.title,
    );
    setSnapshot(nextSnapshot);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Case' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Loading case workspace...</Text>
        </View>
      </>
    );
  }

  if (error || !bundle?.caseItem) {
    return (
      <>
        <Stack.Screen options={{ title: 'Case' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{error ?? 'Case not found.'}</Text>
        </View>
      </>
    );
  }

  const checkpoints = bundle.checkpoints.filter((item) => item.tabKey === activeTab);
  return (
    <>
      <Stack.Screen options={{ title: bundle.caseItem.title }} />
      <View style={styles.page} key={id}>
        <FadeInBlock delayMs={0} durationMs={380}>
          <CaseHeader
            caseItem={bundle.caseItem}
            bookmarked={currentBookmarks.some((item) => item.entityType === 'case')}
            nextLabel={nextMilestone}
            backLabel="Condition"
            onBack={() => router.push(`/condition/${bundle.caseItem!.conditionId}`)}
            onToggleBookmark={() =>
              toggleBookmark({
                caseId: bundle.caseItem!.id,
                entityId: bundle.caseItem!.id,
                entityType: 'case',
                label: bundle.caseItem!.title,
              })
            }
          />
        </FadeInBlock>

        {!isDesktop ? <StudyNav items={navItems} activeKey={activeTab} onSelect={handleTabChange} /> : null}

        <View style={[styles.workspace, isDesktop && styles.workspaceDesktop]}>
          {isDesktop ? (
            <View style={styles.leftRail}>
              <StudyNav
                items={navItems}
                activeKey={activeTab}
                onSelect={handleTabChange}
                orientation="vertical"
              />
            </View>
          ) : null}
          <ScrollView style={styles.mainColumn} contentContainerStyle={styles.mainContent}>
            <Animated.View key={activeTab} entering={FadeIn.duration(260)}>
            {activeTab === 'overview' ? (
              <OverviewPanel
                caseItem={bundle.caseItem}
                sections={bundle.sections}
                mechanisms={bundle.mechanisms}
                resources={bundle.resources}
                onOpenSectionTab={(type) => handleTabChange(`section_${type}`)}
                onOpenMechanisms={() => handleTabChange('mechanisms')}
                onOpenResources={() => handleTabChange('resources')}
              />
            ) : null}

            {activeTab === 'clinical' && bundle.details ? (
              <ClinicalPanel details={bundle.details} />
            ) : null}

            {activeTab === 'diagnosis' && bundle.details ? (
              <DiagnosisPanel details={bundle.details} />
            ) : null}

            {activeTab === 'treatment' && bundle.details ? (
              <TreatmentPanel details={bundle.details} />
            ) : null}

            {activeTab.startsWith('section_')
              ? (sectionsByType[activeTab.replace('section_', '') as SectionType] ?? []).map((section) => (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    completed={completedSet.has(`section_${section.type}`)}
                    relatedResources={bundle.resources.filter((r) => r.sectionType === section.type)}
                  />
                ))
              : null}

            {activeTab === 'mechanisms'
              ? bundle.mechanisms.map((mechanism) => (
                  <View key={mechanism.id} style={styles.whitePanel}>
                    <MechanismRenderer mechanism={mechanism} />
                  </View>
                ))
              : null}

            {activeTab === 'resources' ? (
              <View>
                <ResourcePanel resources={bundle.resources} bookmarks={currentBookmarks} />
              </View>
            ) : null}

            {activeTab === 'quiz' ? (
              <QuizPanel
                questions={bundle.quizzes}
                attempts={caseProgress?.quizAttempts ?? []}
                onAttempt={handleQuizAttempt}
                onCompleteQuiz={() => markComplete('quiz', 'Completed the quiz set')}
              />
            ) : null}

            {checkpoints.map((checkpoint) => (
              <CheckpointCard
                key={checkpoint.id}
                checkpoint={checkpoint}
                completed={completedSet.has(checkpoint.id)}
                onComplete={() => markComplete(checkpoint.id, `Completed checkpoint: ${checkpoint.title}`)}
              />
            ))}

            <View style={styles.flowCard}>
              <View style={styles.flowCopy}>
                <Text style={styles.flowTitle}>
                  {nextItem ? `Up next: ${nextItem.label}` : 'Nice work!'}
                </Text>
                <Text style={styles.flowText}>
                  {nextItem
                    ? 'When you are ready, continue to the next section.'
                    : nextCaseInCondition
                      ? 'Ready for the next case?'
                      : 'Head back whenever you like.'}
                </Text>
              </View>
              <View style={styles.flowActions}>
                {previousItem ? (
                  <Pressable
                    style={styles.flowSecondaryButton}
                    onPress={() => handleTabChange(previousItem.key)}
                  >
                    <Text style={styles.flowSecondaryText}>Back</Text>
                  </Pressable>
                ) : null}
                {nextItem ? (
                  <Pressable
                    style={styles.flowPrimaryButton}
                    onPress={() => handleTabChange(nextItem.key)}
                  >
                    <Text style={styles.flowPrimaryText}>Continue</Text>
                  </Pressable>
                ) : null}
                {!nextItem && nextCaseInCondition ? (
                  <Pressable
                    style={styles.flowPrimaryButton}
                    onPress={() => router.push(`/case/${nextCaseInCondition.id}`)}
                  >
                    <Text style={styles.flowPrimaryText}>
                      {`Next case: ${nextCaseInCondition.title}`}
                    </Text>
                  </Pressable>
                ) : null}
                {!nextItem && !nextCaseInCondition ? (
                  <Pressable
                    style={styles.flowPrimaryButton}
                    onPress={() => router.push(`/condition/${bundle.caseItem!.conditionId}`)}
                  >
                    <Text style={styles.flowPrimaryText}>Back to cases</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

function OverviewPanel({
  caseItem,
  sections,
  mechanisms,
  resources,
  onOpenSectionTab,
  onOpenMechanisms,
  onOpenResources,
}: {
  caseItem: NonNullable<CaseBundle['caseItem']>;
  sections: Section[];
  mechanisms: CaseBundle['mechanisms'];
  resources: CaseBundle['resources'];
  onOpenSectionTab: (type: SectionType) => void;
  onOpenMechanisms: () => void;
  onOpenResources: () => void;
}) {
  return (
    <View>
      <InfoCard label="Description" value={caseItem.shortDescription} />
      <CaseVisualOverview
        sections={sections}
        mechanisms={mechanisms}
        resources={resources}
        onOpenSectionTab={onOpenSectionTab}
        onOpenMechanisms={onOpenMechanisms}
        onOpenResources={onOpenResources}
      />
    </View>
  );
}

function ClinicalPanel({
  details,
}: {
  details: NonNullable<CaseBundle['details']>;
}) {
  const vitalsEntries = Object.entries(details.clinicalNarrative.vitals).filter(
    ([, value]) => value !== undefined,
  );

  return (
    <View>
      <InfoCard label="Presentation" value={details.clinicalNarrative.presentation} />
      <InfoCard label="History" value={details.clinicalNarrative.history} />
      {vitalsEntries.length > 0 ? (
        <View style={styles.whitePanel}>
          <Text style={styles.panelLabel}>Vitals</Text>
          {vitalsEntries.map(([key, value]) => (
            <View key={key} style={styles.kvRow}>
              <Text style={styles.kvKey}>{key}</Text>
              <Text style={styles.kvValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <InfoCard label="Examination" value={details.clinicalNarrative.exam} />
      <View style={styles.whitePanel}>
        <Text style={styles.panelLabel}>Discussion Prompts</Text>
        {details.clinicalNarrative.discussionPrompts.map((prompt, index) => (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{prompt}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DiagnosisPanel({
  details,
}: {
  details: NonNullable<CaseBundle['details']>;
}) {
  return (
    <View>
      <InfoCard label="Diagnosis" value={details.diagnosis.name} />
      <View style={styles.whitePanel}>
        <Text style={styles.panelLabel}>Key Findings</Text>
        {details.diagnosis.keyFindings.map((finding, index) => (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{finding}</Text>
          </View>
        ))}
      </View>
      {details.diagnosis.tests.map((test) => (
        <View key={test.name} style={styles.whitePanel}>
          <Text style={styles.panelTitle}>{test.name}</Text>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Result</Text>
            <Text style={styles.kvValue}>{test.result}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Interpretation</Text>
            <Text style={styles.kvValue}>{test.interpretation}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TreatmentPanel({
  details,
}: {
  details: NonNullable<CaseBundle['details']>;
}) {
  return (
    <View>
      <InfoCard label="Plan" value={details.treatment.plan} />
      <View style={styles.whitePanel}>
        <Text style={styles.panelLabel}>Medications</Text>
        {details.treatment.medications.map((medication) => (
          <View key={medication.name} style={styles.medicationCard}>
            <Text style={styles.panelTitle}>{medication.name}</Text>
            <Text style={styles.medicationClass}>{medication.class}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{medication.role}</Text>
            </View>
          </View>
        ))}
      </View>
      <InfoCard label="Follow-Up" value={details.treatment.followUp} />
      <InfoCard label="Outcome" value={details.treatment.outcome} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  workspace: {
    flex: 1,
  },
  workspaceDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftRail: {
    width: 240,
    backgroundColor: colors.white,
  },
  mainColumn: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: layout.pagePadding,
    paddingVertical: layout.pagePadding,
    paddingBottom: layout.pageBottomPadding,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  whitePanel: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  panelLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  kvKey: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  kvValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    color: colors.maroon,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
  },
  medicationCard: {
    backgroundColor: colors.cloud,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  medicationClass: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroonFaint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleText: {
    color: colors.maroon,
    fontSize: 11,
    fontWeight: '700',
  },
  flowCard: {
    marginTop: 4,
    backgroundColor: colors.maroonDeep,
    borderRadius: 24,
    padding: 22,
  },
  flowCopy: {
    marginBottom: 16,
  },
  flowTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  flowText: {
    color: '#ECDDD6',
    fontSize: 14,
    lineHeight: 22,
  },
  flowActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  flowPrimaryButton: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flowPrimaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  flowSecondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  flowSecondaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
