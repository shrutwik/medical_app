import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { System } from '../../types/system';
import { colors, shadows } from '../../constants/theme';
import { CardChevron, CardProgressTrack, cardPressableBase } from './cardShared';

interface SystemCardProps {
  system: System;
  onPress: () => void;
  meta?: string;
  progress?: number;
}

export default function SystemCard({ system, onPress, meta, progress }: SystemCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open track ${system.name}`}
    >
      <View style={styles.content}>
        <Text style={styles.name}>{system.name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        <CardProgressTrack progress={progress} />
      </View>
      <CardChevron />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.94,
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
  },
});
