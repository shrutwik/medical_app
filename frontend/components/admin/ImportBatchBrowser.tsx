import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';
import type { AdminContentRepository } from '../../services/content/repository';
import type {
  ImportBatchOutputCounts,
  ImportBatchState,
  ImportBatchSummary,
  ImportIssue,
  MappedSourceItem,
} from '../../types/import';

interface ImportBatchBrowserProps {
  repo: AdminContentRepository;
  onImported: () => Promise<void>;
}

const COUNT_LABELS: Array<{ key: keyof ImportBatchOutputCounts; label: string }> = [
  { key: 'sourceFiles', label: 'Source Files' },
  { key: 'systems', label: 'Systems' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'cases', label: 'Cases' },
  { key: 'caseDetails', label: 'Case Details' },
  { key: 'sections', label: 'Sections' },
  { key: 'mechanisms', label: 'Mechanisms' },
  { key: 'resources', label: 'Resources' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'checkpoints', label: 'Checkpoints' },
];

const STATUS_COPY: Record<
  ImportBatchSummary['status'],
  { label: string; textColor: string; backgroundColor: string }
> = {
  incomplete: {
    label: 'Incomplete',
    textColor: colors.textSecondary,
    backgroundColor: colors.cloud,
  },
  not_generated: {
    label: 'Not Generated',
    textColor: colors.gold,
    backgroundColor: colors.goldFaint,
  },
  blocked: {
    label: 'Blocked',
    textColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  warning: {
    label: 'Warnings',
    textColor: colors.gold,
    backgroundColor: colors.goldFaint,
  },
  ready: {
    label: 'Ready',
    textColor: colors.success,
    backgroundColor: colors.successBg,
  },
};

function formatTimestamp(value?: string) {
  if (!value) return 'Not generated yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function describeLoadability(batch?: ImportBatchState) {
  if (!batch) return 'Select a batch to review its import report.';
  if (batch.loadable) {
    return batch.warningCount > 0
      ? 'This batch can be loaded now. Warning-level issues are present, but no blocking errors or unresolved items remain.'
      : 'This batch is safe to load into the active repository.';
  }

  if (!batch.hasOutput || !batch.hasReport) {
    return 'This batch is not generated yet. Add its source files and run the import pipeline before loading.';
  }

  return 'This batch is blocked from loading until its error-level issues and unresolved items are fixed.';
}

export default function ImportBatchBrowser({ repo, onImported }: ImportBatchBrowserProps) {
  const [batches, setBatches] = useState<ImportBatchSummary[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>();
  const [selectedBatch, setSelectedBatch] = useState<ImportBatchState>();
  const [status, setStatus] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<'refresh' | 'load' | 'reset'>();

  const refreshBatches = useCallback(
    async (preferredBatchId?: string) => {
      setLoading(true);
      try {
        const nextBatches = await repo.listImportBatches();
        const nextSelectedBatchId = preferredBatchId ?? selectedBatchId ?? nextBatches[0]?.batchId;
        const nextState = nextSelectedBatchId
          ? await repo.getImportBatchState(nextSelectedBatchId)
          : undefined;

        setBatches(nextBatches);
        setSelectedBatchId(nextSelectedBatchId);
        setSelectedBatch(nextState);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Unable to load import batches.');
      } finally {
        setLoading(false);
      }
    },
    [repo, selectedBatchId],
  );

  useEffect(() => {
    void refreshBatches();
  }, [refreshBatches]);

  const handleReview = useCallback(
    async (batchId: string) => {
      setSelectedBatchId(batchId);
      const nextState = await repo.getImportBatchState(batchId);
      setSelectedBatch(nextState);
      setStatus(undefined);
    },
    [repo],
  );

  const handleRefreshImport = useCallback(async () => {
    if (!selectedBatchId) return;

    setBusyAction('refresh');
    try {
      const result = await repo.runImportBatch(selectedBatchId);
      setStatus(result.message);
      await refreshBatches(selectedBatchId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to refresh import state.');
    } finally {
      setBusyAction(undefined);
    }
  }, [refreshBatches, repo, selectedBatchId]);

  const handleLoadBatch = useCallback(async () => {
    if (!selectedBatchId) return;

    setBusyAction('load');
    try {
      const result = await repo.loadImportBatch(selectedBatchId);
      await onImported();
      setStatus(result.message);
      await refreshBatches(selectedBatchId);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load generated dataset.');
    } finally {
      setBusyAction(undefined);
    }
  }, [onImported, refreshBatches, repo, selectedBatchId]);

  const handleReset = useCallback(async () => {
    setBusyAction('reset');
    try {
      await repo.resetDataset();
      await onImported();
      setStatus('Reset the active repository back to the seed dataset.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to reset the dataset.');
    } finally {
      setBusyAction(undefined);
    }
  }, [onImported, repo]);

  const groupedIssues = useMemo(() => {
    const issues = selectedBatch?.report?.issues ?? [];
    return {
      errors: issues.filter((item: ImportIssue) => item.level === 'error'),
      warnings: issues.filter((item: ImportIssue) => item.level === 'warning'),
    };
  }, [selectedBatch]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Batch Import Browser</Text>
          <Text style={styles.description}>
            Review repo-based content batches, inspect their generated reports, and load clean datasets into the admin repository without pasting raw JSON.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void refreshBatches(selectedBatchId)}
          >
            <Text style={styles.secondaryButtonText}>Refresh Batches</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => void handleReset()}
            disabled={busyAction === 'reset'}
          >
            <Text style={styles.secondaryButtonText}>
              {busyAction === 'reset' ? 'Resetting...' : 'Reset Dataset To Seed'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.workspace}>
        <View style={styles.listColumn}>
          <Text style={styles.panelLabel}>Available Batches</Text>
          {loading ? (
            <Text style={styles.emptyText}>Loading batch manifest...</Text>
          ) : batches.length === 0 ? (
            <Text style={styles.emptyText}>
              No import batches are available yet. Add a folder under `frontend/imports/` and
              generate its output first.
            </Text>
          ) : (
            <ScrollView>
              {batches.map((batch) => {
                const badge = STATUS_COPY[batch.status];
                return (
                  <Pressable
                    key={batch.batchId}
                    style={[
                      styles.batchRow,
                      batch.batchId === selectedBatchId && styles.batchRowActive,
                    ]}
                    onPress={() => void handleReview(batch.batchId)}
                  >
                    <View style={styles.batchRowHeader}>
                      <Text style={styles.batchTitle}>{batch.title}</Text>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: badge.backgroundColor },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: badge.textColor }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.batchMeta}>Folder: {batch.folderName}</Text>
                    <Text style={styles.batchMeta}>
                      {batch.sourceFileCount} source file{batch.sourceFileCount === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.batchMeta}>
                      {batch.errorCount} error{batch.errorCount === 1 ? '' : 's'} ·{' '}
                      {batch.warningCount} warning{batch.warningCount === 1 ? '' : 's'} ·{' '}
                      {batch.unresolvedItemCount} unresolved
                    </Text>
                    <Text style={styles.batchMeta}>
                      Generated: {formatTimestamp(batch.generatedAt)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.detailColumn}>
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderCopy}>
              <Text style={styles.detailTitle}>{selectedBatch?.title ?? 'Batch Review'}</Text>
              <Text style={styles.detailSubtitle}>{describeLoadability(selectedBatch)}</Text>
            </View>
            <View style={styles.detailActions}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => (selectedBatchId ? void handleReview(selectedBatchId) : undefined)}
                disabled={!selectedBatchId}
              >
                <Text style={styles.secondaryButtonText}>Review Batch</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => void handleRefreshImport()}
                disabled={!selectedBatchId || busyAction === 'refresh'}
              >
                <Text style={styles.secondaryButtonText}>
                  {busyAction === 'refresh' ? 'Refreshing...' : 'Run/Refresh Import'}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryButton,
                  (!selectedBatch?.loadable || busyAction === 'load') && styles.primaryButtonDisabled,
                ]}
                onPress={() => void handleLoadBatch()}
                disabled={!selectedBatch?.loadable || busyAction === 'load'}
              >
                <Text style={styles.primaryButtonText}>
                  {busyAction === 'load' ? 'Loading...' : 'Load Generated Dataset'}
                </Text>
              </Pressable>
            </View>
          </View>

          {!selectedBatch ? (
            <Text style={styles.emptyText}>
              Choose a batch on the left to inspect its metadata, counts, and validation report.
            </Text>
          ) : (
            <ScrollView>
              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Batch Metadata</Text>
                <Text style={styles.metaLine}>Batch ID: {selectedBatch.batchId}</Text>
                <Text style={styles.metaLine}>Folder: {selectedBatch.folderName}</Text>
                <Text style={styles.metaLine}>
                  Generated output: {selectedBatch.hasOutput ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.metaLine}>
                  Report available: {selectedBatch.hasReport ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.metaLine}>
                  Last generated: {formatTimestamp(selectedBatch.generatedAt)}
                </Text>
                {selectedBatch.notesPath ? (
                  <Text style={styles.metaLine}>Notes file: {selectedBatch.notesPath}</Text>
                ) : null}
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Output Counts</Text>
                <View style={styles.countGrid}>
                  {COUNT_LABELS.map((item) => (
                    <View key={item.key} style={styles.countTile}>
                      <Text style={styles.countValue}>{selectedBatch.outputCounts[item.key]}</Text>
                      <Text style={styles.countLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Validation Summary</Text>
                <Text style={styles.metaLine}>
                  Safe to load: {selectedBatch.loadable ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.metaLine}>
                  Error-level issues: {selectedBatch.errorCount}
                </Text>
                <Text style={styles.metaLine}>Warnings: {selectedBatch.warningCount}</Text>
                <Text style={styles.metaLine}>
                  Unresolved items: {selectedBatch.unresolvedItemCount}
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Issues</Text>
                {groupedIssues.errors.length === 0 ? null : (
                  <View style={styles.issueGroup}>
                    <Text style={styles.issueGroupTitle}>Errors</Text>
                    {groupedIssues.errors.map((issue: ImportIssue, index: number) => (
                      <View key={`${issue.code}-${index}`} style={styles.issueRowError}>
                        <Text style={styles.issueText}>
                          {issue.code}: {issue.message}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {groupedIssues.warnings.length === 0 ? null : (
                  <View style={styles.issueGroup}>
                    <Text style={styles.issueGroupTitle}>Warnings</Text>
                    {groupedIssues.warnings.map((issue: ImportIssue, index: number) => (
                      <View key={`${issue.code}-${index}`} style={styles.issueRowWarning}>
                        <Text style={styles.issueText}>
                          {issue.code}: {issue.message}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {groupedIssues.errors.length === 0 && groupedIssues.warnings.length === 0 ? (
                  <Text style={styles.emptyText}>No issues found in the generated report.</Text>
                ) : null}
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.sectionTitle}>Unresolved Items</Text>
                {(selectedBatch.report?.unresolvedItems?.length ?? 0) === 0 ? (
                  <Text style={styles.emptyText}>
                    No unresolved items remain for this batch.
                  </Text>
                ) : (
                  selectedBatch.report?.unresolvedItems?.map((item: MappedSourceItem) => (
                    <View key={item.id} style={styles.unresolvedRow}>
                      <Text style={styles.unresolvedTitle}>
                        {item.title ?? item.prompt ?? item.sourceId ?? item.id}
                      </Text>
                      <Text style={styles.unresolvedMeta}>
                        Type: {item.contentType} · Condition: {item.conditionRef ?? 'Unassigned'} ·
                        Case: {item.caseRef ?? 'Unassigned'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}

          {status ? <Text style={styles.statusText}>{status}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.maroonDeep,
    fontSize: 20,
    fontWeight: '800',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 760,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  workspace: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 460,
  },
  listColumn: {
    width: 340,
    backgroundColor: colors.cloud,
    borderRadius: 20,
    padding: 14,
  },
  detailColumn: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: 20,
    padding: 14,
  },
  panelLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  batchRow: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  batchRowActive: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.maroonFaint,
  },
  batchRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  batchTitle: {
    flex: 1,
    color: colors.maroonDeep,
    fontSize: 15,
    fontWeight: '800',
  },
  batchMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 14,
  },
  detailHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  detailTitle: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '800',
  },
  detailSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.maroonDeep,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  metaLine: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  countGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  countTile: {
    width: 120,
    backgroundColor: colors.cloud,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  countValue: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '800',
  },
  countLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  issueGroup: {
    marginBottom: 10,
  },
  issueGroupTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  issueRowError: {
    backgroundColor: colors.errorBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  issueRowWarning: {
    backgroundColor: colors.goldFaint,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  issueText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  unresolvedRow: {
    backgroundColor: colors.cloud,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  unresolvedTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  unresolvedMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
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
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
});
