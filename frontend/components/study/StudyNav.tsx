import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

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
}

export default function StudyNav({ items, activeKey, onSelect }: StudyNavProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
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
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  pill: {
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    paddingVertical: 10,
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
