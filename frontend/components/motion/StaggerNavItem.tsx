import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

const STEP_MS = 28;
const MAX_DELAY_MS = 280;
const DURATION_MS = 300;

type StaggerNavItemProps = {
  index: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Vertical left rail uses fade-down; horizontal uses slide-in. */
  vertical?: boolean;
};

/**
 * Study nav segments: staggered entrance without blocking interaction.
 */
export function StaggerNavItem({ index, children, style, vertical }: StaggerNavItemProps) {
  const delay = Math.min(index * STEP_MS, MAX_DELAY_MS);
  const entering = vertical
    ? FadeInDown.delay(delay).duration(DURATION_MS)
    : SlideInRight.delay(delay).duration(DURATION_MS);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
