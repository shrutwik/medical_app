import { Pressable, Text, View, StyleSheet } from 'react-native';
import { System } from '../../types/system';
import { colors } from '../../constants/theme';

interface SystemCardProps {
  system: System;
  onPress: () => void;
}

export default function SystemCard({ system, onPress }: SystemCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{system.name}</Text>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: colors.textMuted,
  },
});
