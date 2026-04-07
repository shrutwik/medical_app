import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import ImportBatchBrowser from './ImportBatchBrowser';
import ImportManager from './ImportManager';
import { colors } from '../../constants/theme';
import {
  getAdminSession,
  hasFirebaseConfig,
  isAdminDemoEnabled,
  signInAdmin,
  signOutAdmin,
  type AdminSession,
} from '../../services/auth/firebase';
import { getAdminContentRepository, type AdminCase, type ContentDataset } from '../../services/content/repository';
import type { CaseDetail } from '../../types/case';
import type { StudyCheckpoint } from '../../types/checkpoint';
import type { Condition } from '../../types/condition';
import type { Mechanism } from '../../types/mechanism';
import type { QuizQuestion } from '../../types/quiz';
import type { Resource } from '../../types/resource';
import type { Section } from '../../types/section';
import type { System } from '../../types/system';

type TabKey =
  | 'systems'
  | 'conditions'
  | 'cases'
  | 'caseDetails'
  | 'sections'
  | 'mechanisms'
  | 'resources'
  | 'quizzes'
  | 'checkpoints';

interface AdminTabConfig<T> {
  key: TabKey;
  label: string;
  getItems: (dataset: ContentDataset) => T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  template: (dataset: ContentDataset) => T;
  save: (repo: ReturnType<typeof getAdminContentRepository>, item: T) => Promise<void>;
}

const TABS: AdminTabConfig<any>[] = [
  {
    key: 'systems',
    label: 'Systems',
    getItems: (dataset) => dataset.systems,
    getKey: (item: System) => item.id,
    getLabel: (item: System) => item.name,
    template: () => ({ id: `system_${Date.now()}`, name: 'New System' }),
    save: (repo, item: System) => repo.saveSystem(item),
  },
  {
    key: 'conditions',
    label: 'Conditions',
    getItems: (dataset) => dataset.conditions,
    getKey: (item: Condition) => item.id,
    getLabel: (item: Condition) => item.name,
    template: (dataset) => ({
      id: `condition_${Date.now()}`,
      systemId: dataset.systems[0]?.id ?? 'system_id',
      name: 'New Condition',
      summary: 'Brief summary',
      learningGoals: ['Add learning goal'],
    }),
    save: (repo, item: Condition) => repo.saveCondition(item),
  },
  {
    key: 'cases',
    label: 'Cases',
    getItems: (dataset) => dataset.cases,
    getKey: (item: AdminCase) => item.id,
    getLabel: (item: AdminCase) => item.title,
    template: (dataset) => ({
      id: `case_${Date.now()}`,
      conditionId: dataset.conditions[0]?.id ?? 'condition_id',
      title: 'New Case',
      shortDescription: 'Short description',
      difficulty: 'medium',
      tags: ['tag'],
      publishStatus: 'draft',
      updatedAt: new Date().toISOString(),
    }),
    save: (repo, item: AdminCase) => repo.saveCase(item),
  },
  {
    key: 'caseDetails',
    label: 'Case Details',
    getItems: (dataset) => dataset.caseDetails,
    getKey: (item: CaseDetail) => item.caseId,
    getLabel: (item: CaseDetail) => item.caseId,
    template: (dataset) => ({
      caseId: dataset.cases[0]?.id ?? 'case_id',
      clinicalNarrative: {
        presentation: 'Presentation',
        history: 'History',
        vitals: {},
        exam: 'Exam findings',
        discussionPrompts: ['Prompt'],
      },
      diagnosis: {
        name: 'Diagnosis',
        keyFindings: ['Finding'],
        tests: [
          {
            name: 'Test name',
            result: 'Result',
            interpretation: 'Interpretation',
          },
        ],
      },
      treatment: {
        plan: 'Treatment plan',
        medications: [
          {
            name: 'Medication',
            class: 'Drug class',
            role: 'role',
          },
        ],
        followUp: 'Follow-up',
        outcome: 'Outcome',
      },
    }),
    save: (repo, item: CaseDetail) => repo.saveCaseDetail(item),
  },
  {
    key: 'sections',
    label: 'Sections',
    getItems: (dataset) => dataset.sections,
    getKey: (item: Section) => item.id,
    getLabel: (item: Section) => item.title,
    template: (dataset) => ({
      id: `section_${Date.now()}`,
      caseId: dataset.cases[0]?.id ?? 'case_id',
      type: 'narrative',
      title: 'New Section',
      content: 'Section content',
      order: 1,
      tags: ['tag'],
    }),
    save: (repo, item: Section) => repo.saveSection(item),
  },
  {
    key: 'mechanisms',
    label: 'Mechanisms',
    getItems: (dataset) => dataset.mechanisms,
    getKey: (item: Mechanism) => item.id,
    getLabel: (item: Mechanism) => item.title,
    template: (dataset) => ({
      id: `mechanism_${Date.now()}`,
      caseId: dataset.cases[0]?.id ?? 'case_id',
      title: 'New Mechanism',
      relatedDrug: '',
      steps: [
        {
          stepNumber: 1,
          label: 'Step label',
          description: 'Step description',
        },
      ],
    }),
    save: (repo, item: Mechanism) => repo.saveMechanism(item),
  },
  {
    key: 'resources',
    label: 'Resources',
    getItems: (dataset) => dataset.resources,
    getKey: (item: Resource) => item.id,
    getLabel: (item: Resource) => item.title,
    template: (dataset) => ({
      id: `resource_${Date.now()}`,
      caseId: dataset.cases[0]?.id ?? 'case_id',
      sectionType: 'narrative',
      type: 'diagram',
      title: 'New Resource',
      description: 'Description',
      caption: 'Caption',
      sourceType: 'pdf',
      sourceReference: {
        fileName: 'source.pdf',
        pageNumber: 1,
      },
      assetKey: 'asset_key',
      tags: ['tag'],
    }),
    save: (repo, item: Resource) => repo.saveResource(item),
  },
  {
    key: 'quizzes',
    label: 'Quizzes',
    getItems: (dataset) => dataset.quizzes,
    getKey: (item: QuizQuestion) => item.id,
    getLabel: (item: QuizQuestion) => item.question,
    template: (dataset) => ({
      id: `quiz_${Date.now()}`,
      caseId: dataset.cases[0]?.id ?? 'case_id',
      sectionType: 'narrative',
      question: 'Question stem',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answerIndex: 0,
      explanation: 'Explanation',
      tags: ['tag'],
    }),
    save: (repo, item: QuizQuestion) => repo.saveQuiz(item),
  },
  {
    key: 'checkpoints',
    label: 'Checkpoints',
    getItems: (dataset) => dataset.checkpoints,
    getKey: (item: StudyCheckpoint) => item.id,
    getLabel: (item: StudyCheckpoint) => item.title,
    template: (dataset) => ({
      id: `checkpoint_${Date.now()}`,
      caseId: dataset.cases[0]?.id ?? 'case_id',
      tabKey: 'overview',
      title: 'New checkpoint',
      prompt: 'Prompt',
      hint: 'Hint',
      answer: 'Coaching note',
    }),
    save: (repo, item: StudyCheckpoint) => repo.saveCheckpoint(item),
  },
];

export default function AdminConsole() {
  const router = useRouter();
  const repo = useMemo(() => getAdminContentRepository(), []);
  const [session, setSession] = useState<AdminSession | null>();
  const [dataset, setDataset] = useState<ContentDataset>();
  const [tab, setTab] = useState<TabKey>('systems');
  const [selectedKey, setSelectedKey] = useState<string>();
  const [editor, setEditor] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>();
  const [loading, setLoading] = useState(true);
  const firebaseEnabled = hasFirebaseConfig();
  const demoEnabled = isAdminDemoEnabled();
  const adminSignInEnabled = firebaseEnabled || demoEnabled;

  const load = useCallback(async () => {
    setLoading(true);
    const [nextSession, nextDataset] = await Promise.all([
      getAdminSession(),
      repo.getDataset(),
    ]);
    setSession(nextSession);
    setDataset(nextDataset);
    setLoading(false);
  }, [repo]);

  useEffect(() => {
    load();
  }, [load]);

  const activeTab = TABS.find((item) => item.key === tab) ?? TABS[0];
  const items = dataset ? activeTab.getItems(dataset) : [];

  const startNew = useCallback(() => {
    if (!dataset) return;
    setSelectedKey(undefined);
    setEditor(JSON.stringify(activeTab.template(dataset), null, 2));
  }, [activeTab, dataset]);

  const openItem = useCallback(
    (item: any) => {
      setSelectedKey(activeTab.getKey(item));
      setEditor(JSON.stringify(item, null, 2));
    },
    [activeTab],
  );

  const refreshDataset = useCallback(async () => {
    const nextDataset = await repo.getDataset();
    setDataset(nextDataset);
  }, [repo]);

  const handleSave = useCallback(async () => {
    try {
      const parsed = JSON.parse(editor);
      await activeTab.save(repo, parsed);
      setStatus(`${activeTab.label.slice(0, -1)} saved.`);
      await refreshDataset();
      setSelectedKey(activeTab.getKey(parsed));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Save failed.');
    }
  }, [activeTab, editor, refreshDataset, repo]);

  const handleDelete = useCallback(async () => {
    if (!selectedKey) return;
    await repo.deleteItem(activeTab.key, selectedKey);
    setStatus(`${activeTab.label.slice(0, -1)} deleted.`);
    setSelectedKey(undefined);
    setEditor('');
    await refreshDataset();
  }, [activeTab.key, activeTab.label, refreshDataset, repo, selectedKey]);

  const handleLogin = useCallback(async () => {
    try {
      const nextSession = await signInAdmin(email, password);
      setSession(nextSession);
      setStatus(`Signed in as ${nextSession.email}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Login failed.');
    }
  }, [email, password]);

  const handleLogout = useCallback(async () => {
    await signOutAdmin();
    setSession(null);
    setStatus('Signed out.');
  }, []);

  const previewCaseId = useMemo(() => {
    if (!editor) return undefined;
    try {
      const parsed = JSON.parse(editor);
      if (tab === 'cases') return parsed.id as string;
      return parsed.caseId as string | undefined;
    } catch {
      return undefined;
    }
  }, [editor, tab]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.statusText}>Loading admin workspace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Internal Content Workspace</Text>
          <Text style={styles.title}>Admin Console</Text>
            <Text style={styles.subtitle}>
            {firebaseEnabled
              ? 'Firebase-backed admin mode is configured.'
              : demoEnabled
                ? 'Local demo mode is enabled for this workspace.'
                : 'Admin sign-in is disabled until Firebase credentials or explicit demo mode env vars are configured.'}
          </Text>
        </View>
        {session ? (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        ) : null}
      </View>

      {!session ? (
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Admin Sign-In</Text>
          <TextInput
            placeholder="admin@medical.app"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            editable={adminSignInEnabled}
          />
          <TextInput
            placeholder={firebaseEnabled ? 'Password' : 'Demo password'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={adminSignInEnabled}
          />
          <Pressable
            style={[styles.primaryButton, !adminSignInEnabled && styles.primaryButtonDisabled]}
            onPress={handleLogin}
            disabled={!adminSignInEnabled}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
          {!adminSignInEnabled ? (
            <Text style={styles.statusText}>
              Set Firebase env vars, or enable demo mode with
              {' '}`EXPO_PUBLIC_ENABLE_ADMIN_DEMO=true` and
              {' '}`EXPO_PUBLIC_ADMIN_DEMO_PASSWORD`.
            </Text>
          ) : null}
          {status ? <Text style={styles.statusText}>{status}</Text> : null}
        </View>
      ) : (
        <View style={styles.adminBody}>
          <ImportBatchBrowser repo={repo} onImported={refreshDataset} />
          <ImportManager repo={repo} onImported={refreshDataset} />

          <View style={styles.workspace}>
            <View style={styles.sidebar}>
              <Text style={styles.sidebarLabel}>Collections</Text>
              {TABS.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.tabButton, item.key === tab && styles.tabButtonActive]}
                  onPress={() => {
                    setTab(item.key);
                    setSelectedKey(undefined);
                    setEditor('');
                    setStatus(undefined);
                  }}
                >
                  <Text style={[styles.tabText, item.key === tab && styles.tabTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.listColumn}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>{activeTab.label}</Text>
                <Pressable style={styles.secondaryButton} onPress={startNew}>
                  <Text style={styles.secondaryButtonText}>New</Text>
                </Pressable>
              </View>
              <ScrollView>
                {items.map((item) => (
                  <Pressable
                    key={activeTab.getKey(item)}
                    style={[
                      styles.itemRow,
                      activeTab.getKey(item) === selectedKey && styles.itemRowActive,
                    ]}
                    onPress={() => openItem(item)}
                  >
                    <Text style={styles.itemText} numberOfLines={2}>
                      {activeTab.getLabel(item)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.editorColumn}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Editor</Text>
                <View style={styles.editorActions}>
                  {previewCaseId ? (
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => router.push(`/case/${previewCaseId}?preview=1`)}
                    >
                      <Text style={styles.secondaryButtonText}>Preview</Text>
                    </Pressable>
                  ) : null}
                  <Pressable style={styles.secondaryButton} onPress={refreshDataset}>
                    <Text style={styles.secondaryButtonText}>Refresh</Text>
                  </Pressable>
                </View>
              </View>
              <TextInput
                multiline
                value={editor}
                onChangeText={setEditor}
                placeholder="Select an item or create a new one to edit JSON."
                style={styles.editor}
                textAlignVertical="top"
              />
              <View style={styles.footerActions}>
                <Pressable style={styles.primaryButton} onPress={handleSave}>
                  <Text style={styles.primaryButtonText}>Save</Text>
                </Pressable>
                {selectedKey ? (
                  <Pressable style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                ) : null}
              </View>
              {status ? <Text style={styles.statusText}>{status}</Text> : null}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.offWhite,
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  title: {
    color: colors.maroonDeep,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 680,
  },
  logoutButton: {
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  loginCard: {
    width: 420,
    maxWidth: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginTitle: {
    color: colors.maroonDeep,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  input: {
    backgroundColor: colors.cloud,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 600,
  },
  sidebar: {
    width: 180,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sidebarLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  tabButton: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.maroonFaint,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.maroon,
  },
  listColumn: {
    width: 280,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editorColumn: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  columnTitle: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '800',
  },
  itemRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: colors.cloud,
  },
  itemRowActive: {
    backgroundColor: colors.maroonFaint,
  },
  itemText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  editorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editor: {
    flex: 1,
    minHeight: 440,
    backgroundColor: colors.cloud,
    borderRadius: 20,
    padding: 16,
    color: colors.textPrimary,
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 20,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.errorBg,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  deleteText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  adminBody: {
    flex: 1,
  },
});
