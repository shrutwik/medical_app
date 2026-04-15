import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STEP_MS = 48;
const MAX_DELAY_MS = 420;
const DURATION_MS = 380;

type StaggerInProps = {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Staggered entrance for vertical lists (tracks, conditions, cases).
 */
export function StaggerIn({ index, children, style }: StaggerInProps) {
  const delay = Math.min(index * STEP_MS, MAX_DELAY_MS);
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(DURATION_MS)} style={style}>
      {children}
    </Animated.View>
  );
}

type FadeInBlockProps = {
  children: ReactNode;
  delayMs?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Single block fade-in (hero, section headers).
 */
export function FadeInBlock({ children, delayMs = 0, durationMs = 400, style }: FadeInBlockProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delayMs).duration(durationMs)} style={style}>
      {children}
    </Animated.View>
  );
}
