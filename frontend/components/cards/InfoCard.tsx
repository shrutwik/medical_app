import { View, Text, StyleSheet } from 'react-native';
import { colors, layout } from '../../constants/theme';

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
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.maroon,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.maroon,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  value: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
