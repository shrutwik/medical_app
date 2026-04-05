import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export interface PillItem {
  key: string;
  label: string;
  accent?: boolean;
}

interface ContentPillsProps {
  items: PillItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function ContentPills({ items, activeKey, onSelect }: ContentPillsProps) {
  return (
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
            style={[
              styles.pill,
              item.accent && !active && styles.pillAccent,
              active && styles.pillActive,
            ]}
            onPress={() => onSelect(item.key)}
          >
            <Text
              style={[
                styles.label,
                item.accent && !active && styles.labelAccent,
                active && styles.labelActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBg,
  },
  pillAccent: {
    backgroundColor: colors.maroonFaint,
    borderColor: colors.maroon,
  },
  pillActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelAccent: {
    color: colors.maroon,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.white,
  },
});
