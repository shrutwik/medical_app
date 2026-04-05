import { View, Text, StyleSheet } from 'react-native';
import { Mechanism } from '../../types/mechanism';
import { colors } from '../../constants/theme';

interface MechanismRendererProps {
  mechanism: Mechanism;
}

export default function MechanismRenderer({ mechanism }: MechanismRendererProps) {
  const sorted = [...mechanism.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mechanism.title}</Text>
      {mechanism.relatedDrug ? (
        <Text style={styles.drug}>Drug: {mechanism.relatedDrug}</Text>
      ) : null}
      {sorted.map((step) => (
        <View key={step.stepNumber} style={styles.step}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>{step.stepNumber}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  drug: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '500',
    marginBottom: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
