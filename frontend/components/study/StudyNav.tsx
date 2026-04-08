import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
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
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[
                styles.pill,
                item.completed && !active && styles.pillComplete,
                item.accent && !active && styles.pillAccent,
                active && styles.pillActive,
                isVertical && styles.pillVertical,
              ]}
            >
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.label,
                    item.completed && !active && styles.labelComplete,
                    item.accent && !active && styles.labelAccent,
                    active && styles.labelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge ? <Text style={[styles.badge, active && styles.badgeActive]}>{item.badge}</Text> : null}
              </View>
            </Pressable>
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
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    height: '100%',
  },
  container: {
    paddingHorizontal: layout.pagePadding,
    paddingVertical: 12,
    gap: 10,
  },
  containerVertical: {
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  pill: {
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillVertical: {
    width: '100%',
    borderRadius: layout.radiusMd,
  },
  pillAccent: {
    borderColor: colors.cardBgStrong,
  },
  pillComplete: {
    backgroundColor: colors.cloud,
    borderColor: colors.cardBgStrong,
  },
  pillActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelAccent: {
    color: colors.textSecondary,
  },
  labelComplete: {
    color: colors.maroon,
  },
  labelActive: {
    color: colors.white,
  },
  badge: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeActive: {
    color: colors.white,
  },
});
