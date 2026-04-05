import { useState, useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  getCaseById,
  getCaseDetails,
  getSectionsByCase,
  getMechanismsByCase,
  getResourcesByCase,
  getQuizzesByCase,
} from '../../services/data';
import ContentPills, { PillItem } from '../../components/navigation/ContentPills';
import InfoCard from '../../components/cards/InfoCard';
import SectionRenderer from '../../components/sections/SectionRenderer';
import MechanismRenderer from '../../components/sections/MechanismRenderer';
import ResourceCard from '../../components/cards/ResourceCard';
import QuizRenderer from '../../components/quiz/QuizRenderer';
import { colors } from '../../constants/theme';
import type { SectionType } from '../../types/section';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const caseId = id ?? '';

  const caseItem = getCaseById(caseId);
  const details = getCaseDetails(caseId);
  const sections = getSectionsByCase(caseId);
  const mechanisms = getMechanismsByCase(caseId);
  const resources = getResourcesByCase(caseId);
  const quizzes = getQuizzesByCase(caseId);

  const sectionsByType = useMemo(() => {
    const map: Partial<Record<SectionType, typeof sections>> = {};
    for (const s of sections) {
      if (!map[s.type]) map[s.type] = [];
      map[s.type]!.push(s);
    }
    return map;
  }, [sections]);

  const pills = useMemo(() => {
    const items: PillItem[] = [{ key: 'overview', label: 'Overview' }];
    if (details) {
      items.push({ key: 'clinical', label: 'Clinical' });
      items.push({ key: 'diagnosis', label: 'Diagnosis' });
      items.push({ key: 'treatment', label: 'Treatment' });
    }
    if (quizzes.length > 0) {
      items.push({ key: 'quiz', label: `Quiz (${quizzes.length})`, accent: true });
    }
    for (const type of Object.keys(sectionsByType) as SectionType[]) {
      items.push({ key: `section_${type}`, label: SECTION_LABELS[type] ?? type });
    }
    if (mechanisms.length > 0) items.push({ key: 'mechanisms', label: 'Mechanisms' });
    if (resources.length > 0) items.push({ key: 'resources', label: 'Resources' });
    return items;
  }, [details, sectionsByType, mechanisms, resources, quizzes]);

  const [activeTab, setActiveTab] = useState('overview');

  if (!caseItem) {
    return (
      <>
        <Stack.Screen options={{ title: 'Case' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Case not found.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Case Detail' }} />
      <View style={styles.header}>
        <Text style={styles.title}>{caseItem.title}</Text>
        <Text style={styles.subtitle}>{caseItem.shortDescription}</Text>
      </View>

      <ContentPills items={pills} activeKey={activeTab} onSelect={setActiveTab} />

      <ScrollView contentContainerStyle={styles.content} key={activeTab}>
        {activeTab === 'overview' && <OverviewPanel caseItem={caseItem} />}
        {activeTab === 'clinical' && details && <ClinicalPanel details={details} />}
        {activeTab === 'diagnosis' && details && <DiagnosisPanel details={details} />}
        {activeTab === 'treatment' && details && <TreatmentPanel details={details} />}
        {activeTab === 'quiz' && <QuizRenderer questions={quizzes} />}

        {activeTab.startsWith('section_') && (() => {
          const type = activeTab.replace('section_', '') as SectionType;
          const items = sectionsByType[type] ?? [];
          return items.map((s) => <SectionRenderer key={s.id} section={s} />);
        })()}

        {activeTab === 'mechanisms' &&
          mechanisms.map((m) => <MechanismRenderer key={m.id} mechanism={m} />)}

        {activeTab === 'resources' &&
          resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
      </ScrollView>
    </>
  );
}

function OverviewPanel({ caseItem }: { caseItem: NonNullable<ReturnType<typeof getCaseById>> }) {
  return (
    <View>
      <InfoCard label="Description" value={caseItem.shortDescription} />
      <InfoCard label="Difficulty" value={caseItem.difficulty} />
      {caseItem.tags.length > 0 && (
        <View style={styles.tagRow}>
          {caseItem.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ClinicalPanel({ details }: { details: NonNullable<ReturnType<typeof getCaseDetails>> }) {
  const { clinicalNarrative } = details;
  const vitalsEntries = Object.entries(clinicalNarrative.vitals).filter(
    ([, val]) => val !== undefined,
  );

  return (
    <View>
      <InfoCard label="Presentation" value={clinicalNarrative.presentation} />
      <InfoCard label="History" value={clinicalNarrative.history} />
      {vitalsEntries.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Vitals</Text>
          {vitalsEntries.map(([key, val]) => (
            <View key={key} style={styles.kvRow}>
              <Text style={styles.kvKey}>{key}</Text>
              <Text style={styles.kvVal}>{String(val)}</Text>
            </View>
          ))}
        </View>
      )}
      <InfoCard label="Examination" value={clinicalNarrative.exam} />
      {clinicalNarrative.discussionPrompts.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Discussion Prompts</Text>
          {clinicalNarrative.discussionPrompts.map((prompt, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{prompt}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function DiagnosisPanel({ details }: { details: NonNullable<ReturnType<typeof getCaseDetails>> }) {
  const { diagnosis } = details;

  return (
    <View>
      <InfoCard label="Diagnosis" value={diagnosis.name} />
      {diagnosis.keyFindings.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Key Findings</Text>
          {diagnosis.keyFindings.map((finding, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{finding}</Text>
            </View>
          ))}
        </View>
      )}
      {diagnosis.tests.length > 0 && (
        <View>
          <Text style={styles.groupLabel}>Diagnostic Tests</Text>
          {diagnosis.tests.map((test, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Result</Text>
                <Text style={styles.kvVal}>{test.result}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvKey}>Interpretation</Text>
                <Text style={styles.kvVal}>{test.interpretation}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TreatmentPanel({ details }: { details: NonNullable<ReturnType<typeof getCaseDetails>> }) {
  const { treatment } = details;

  return (
    <View>
      <InfoCard label="Plan" value={treatment.plan} />
      {treatment.medications.length > 0 && (
        <View>
          <Text style={styles.groupLabel}>Medications</Text>
          {treatment.medications.map((med, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.medName}>{med.name}</Text>
              <Text style={styles.medDetail}>{med.class}</Text>
              <View style={styles.medRoleBadge}>
                <Text style={styles.medRoleText}>{med.role}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <InfoCard label="Follow-Up" value={treatment.followUp} />
      <InfoCard label="Outcome" value={treatment.outcome} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  content: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.maroonFaint,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.maroon,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.maroon,
    marginBottom: 8,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: colors.maroon,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  kvKey: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  kvVal: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  medDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  medRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroonFaint,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  medRoleText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.maroon,
  },
});
