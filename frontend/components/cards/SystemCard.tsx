import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { System } from '../../types/system';
import { colors, layout, shadows } from '../../constants/theme';
import { CardProgressTrack, cardPressableBase } from './cardShared';

// Map system names to an emoji icon + accent color
const SYSTEM_META: Record<string, { icon: string; accent: string; bg: string }> = {
  cardiovascular: { icon: '❤️', accent: colors.trackCardio, bg: '#FFF0F0' },
  respiratory:    { icon: '🫁', accent: colors.trackResp,   bg: '#EFF4FF' },
  neurology:      { icon: '🧠', accent: colors.trackNeuro,  bg: '#F5F0FF' },
  gastrointestinal: { icon: '🫀', accent: colors.trackGI,   bg: '#F0FFF5' },
  endocrine:      { icon: '⚗️', accent: colors.trackEndo,   bg: '#FFFBF0' },
  renal:          { icon: '💧', accent: colors.trackRenal,  bg: '#EFF9FF' },
  musculoskeletal: { icon: '🦴', accent: colors.trackMuscle, bg: '#FFF8F0' },
};

function resolveSystemMeta(name: string) {
  const key = name.toLowerCase().split(' ')[0];
  return SYSTEM_META[key] ?? { icon: '📋', accent: colors.maroon, bg: colors.maroonFaint };
}

interface SystemCardProps {
  system: System;
  onPress: () => void;
  meta?: string;
  progress?: number;
}

export default function SystemCard({ system, onPress, meta, progress }: SystemCardProps) {
  const { icon, accent, bg } = resolveSystemMeta(system.name);
  const done = typeof progress === 'number' && progress >= 100;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardPressableBase, shadows.card, styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open track ${system.name}`}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: accent }]} />

      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: bg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{system.name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {done ? (
          <View style={styles.doneBadge}>
            <Text style={styles.doneText}>✓ Complete</Text>
          </View>
        ) : (
          <CardProgressTrack progress={progress} />
        )}
      </View>

      {/* Chevron */}
      <View style={[styles.chevronBubble, { backgroundColor: bg, borderColor: accent + '30' }]}>
        <Text style={[styles.chevron, { color: accent }]}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingLeft: 0,
    paddingVertical: 0,
    overflow: 'hidden',
    alignItems: 'stretch',
    gap: 0,
  },
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.995 }],
  },
  accentStrip: {
    width: 4,
    borderTopLeftRadius: layout.radiusLg,
    borderBottomLeftRadius: layout.radiusLg,
    alignSelf: 'stretch',
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginVertical: 20,
    flexShrink: 0,
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 20,
    paddingLeft: 14,
    paddingRight: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  doneBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  doneText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  chevronBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 18,
    marginVertical: 'auto',
    alignSelf: 'center',
    flexShrink: 0,
  },
  chevron: {
    fontSize: 15,
    fontWeight: '800',
  },
});
