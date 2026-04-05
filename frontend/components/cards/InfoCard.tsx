import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface InfoCardProps {
  label: string;
  value: string;
}

export default function InfoCard({ label, value }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
});
