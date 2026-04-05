import { View, Text, StyleSheet } from 'react-native';
import { Section } from '../../types/section';
import { colors } from '../../constants/theme';

interface SectionRendererProps {
  section: Section;
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title}</Text>
      <Text style={styles.content}>{section.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
