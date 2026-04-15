import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { StaggerNavItem } from '../motion/StaggerNavItem';
import { colors, layout } from '../../constants/theme';

export interface StudyNavItem {
  key: string;
  label: string;
  badge?: string;
  completed?: boolean;
  accent?: boolean;
}

interface StudyNavProps {
  items: StudyNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export default function StudyNav({
  items,
  activeKey,
  onSelect,
  orientation = 'horizontal',
}: StudyNavProps) {
  const isVertical = orientation === 'vertical';

  return (
    <View style={[styles.wrapper, isVertical && styles.wrapperVertical]}>
      <ScrollView
        horizontal={!isVertical}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, isVertical && styles.containerVertical]}
      >
        {items.map((item, index) => {
          const active = item.key === activeKey;
          return (
            <StaggerNavItem
              key={item.key}
              index={index}
              vertical={isVertical}
              style={isVertical ? styles.staggerVertical : undefined}
            >
              <Pressable
                onPress={() => onSelect(item.key)}
                style={({ pressed }) => [
                  styles.pill,
                  item.completed && !active && styles.pillComplete,
                  item.accent && !active && styles.pillAccent,
                  active && styles.pillActive,
                  isVertical && styles.pillVertical,
                  pressed && styles.pillPressed,
                ]}
              >
                <View style={styles.labelRow}>
                  {/* Status indicator dot */}
                  {isVertical ? (
                    <View style={[
                      styles.statusDot,
                      item.completed && !active && styles.statusDotComplete,
                      item.accent && !active && styles.statusDotAccent,
                      active && styles.statusDotActive,
                    ]} />
                  ) : null}

                  <Text
                    style={[
                      styles.label,
                      item.completed && !active && styles.labelComplete,
                      item.accent && !active && styles.labelAccent,
                      active && styles.labelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>

                  {item.badge ? (
                    <View style={[styles.badgePill, active && styles.badgePillActive]}>
                      <Text style={[styles.badge, active && styles.badgeActive]}>{item.badge}</Text>
                    </View>
                  ) : null}

                  {/* Checkmark for completed */}
                  {item.completed && !active ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
                </View>
              </Pressable>
            </StaggerNavItem>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  wrapperVertical: {
    borderBottomWidth: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    height: '100%',
    backgroundColor: colors.cardBg,
  },
  container: {
    paddingHorizontal: layout.pagePadding,
    paddingVertical: 12,
    gap: 8,
  },
  containerVertical: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 4,
    flexDirection: 'column',
  },
  pill: {
    borderRadius: 999,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillVertical: {
    borderRadius: layout.radiusMd,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  pillAccent: {
    backgroundColor: colors.goldFaint,
    borderColor: '#F2D0A5',
  },
  pillComplete: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  pillActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  pillPressed: {
    opacity: 0.8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.borderStrong,
    flexShrink: 0,
  },
  statusDotComplete: {
    backgroundColor: colors.success,
  },
  statusDotAccent: {
    backgroundColor: colors.gold,
  },
  statusDotActive: {
    backgroundColor: colors.white,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  labelAccent: {
    color: colors.goldDeep,
    fontWeight: '700',
  },
  labelComplete: {
    color: colors.success,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.white,
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgePillActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeActive: {
    color: colors.white,
  },
  checkmark: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  staggerVertical: {
    width: '100%',
  },
});
