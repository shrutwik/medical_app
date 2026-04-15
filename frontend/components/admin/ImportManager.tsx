import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../constants/theme';
import type { AdminContentRepository, ContentDataset } from '../../services/content/repository';

interface ImportManagerProps {
  repo: AdminContentRepository;
  onImported: () => Promise<void>;
}

function extractDataset(payload: unknown): ContentDataset {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Import payload must be a JSON object.');
  }

  const candidate = payload as { dataset?: unknown };
  const dataset = candidate.dataset && typeof candidate.dataset === 'object'
    ? candidate.dataset
    : payload;

  return dataset as ContentDataset;
}

export default function ImportManager({ repo, onImported }: ImportManagerProps) {
  const [importJson, setImportJson] = useState('');
  const [status, setStatus] = useState<string>();

  const handleReplace = async () => {
    try {
      const parsed = JSON.parse(importJson);
      await repo.replaceDataset(extractDataset(parsed));
      await onImported();
      setStatus('Imported dataset into the local/admin repository.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed.');
    }
  };

  const handleReset = async () => {
    await repo.resetDataset();
    await onImported();
    setStatus('Reset repository content back to the seed dataset.');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Dataset Import</Text>
      <Text style={styles.description}>
        Paste the generated `content-dataset.json` output from the import pipeline here to replace the current repository dataset before admin review.
      </Text>
      <TextInput
        multiline
        textAlignVertical="top"
        value={importJson}
        onChangeText={setImportJson}
        placeholder="Paste generated content-dataset.json here"
        style={styles.textarea}
      />
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleReplace}>
          <Text style={styles.primaryText}>Replace Dataset</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleReset}>
          <Text style={styles.secondaryText}>Reset To Seed</Text>
        </Pressable>
      </View>
      <Text style={styles.helper}>
        Tip: review the generated import report before replacing the dataset so unresolved items are fixed first.
      </Text>
      {status ? <Text style={styles.status}>{status}</Text> : null}
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
  title: {
    color: colors.maroonDeep,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  textarea: {
    minHeight: 160,
    borderRadius: 18,
    backgroundColor: colors.cloud,
    padding: 14,
    color: colors.textPrimary,
    fontFamily: 'Courier',
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  helper: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  status: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
});
