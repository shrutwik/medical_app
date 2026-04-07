import { Pressable, Text, View, StyleSheet } from 'react-native';
import { System } from '../../types/system';
import { colors } from '../../constants/theme';

interface SystemCardProps {
  system: System;
  onPress: () => void;
  meta?: string;
  progress?: number;
}

export default function SystemCard({ system, onPress, meta, progress }: SystemCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.name}>{system.name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {typeof progress === 'number' ? (
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.sideMeta}>
        <Text style={styles.sideMetaText}>Open</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.maroonDeep,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: colors.cardBg,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.maroon,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sideMeta: {
    marginLeft: 14,
    alignSelf: 'flex-start',
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sideMetaText: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '700',
  },
});
