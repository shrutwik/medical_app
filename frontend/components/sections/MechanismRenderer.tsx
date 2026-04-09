import { View, Text, StyleSheet } from 'react-native';
import ContentIllustration from '../media/ContentIllustration';
import { StaggerIn } from '../motion/StaggerIn';
import type { Mechanism } from '../../types/mechanism';
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

      {mechanism.diagramUrl ? (
        <ContentIllustration
          url={mechanism.diagramUrl}
          caption={mechanism.diagramCaption}
          animationIndex={0}
        />
      ) : null}

      {sorted.map((step, index) => (
        <StaggerIn key={step.stepNumber} index={index}>
          <View style={styles.step}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{step.stepNumber}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              {step.illustrationUrl ? (
                <ContentIllustration
                  url={step.illustrationUrl}
                  caption={step.illustrationCaption}
                  animationIndex={index}
                />
              ) : null}
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        </StaggerIn>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 6,
  },
  drug: {
    fontSize: 13,
    color: colors.maroon,
    fontWeight: '600',
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.maroon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
    minWidth: 0,
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
