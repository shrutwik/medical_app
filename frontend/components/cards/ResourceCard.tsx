import { View, Text, StyleSheet } from 'react-native';
import { Resource } from '../../types/resource';
import { colors } from '../../constants/theme';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{resource.type}</Text>
      </View>
      <Text style={styles.title}>{resource.title}</Text>
      <Text style={styles.description}>{resource.description}</Text>
      {resource.caption ? (
        <Text style={styles.caption}>{resource.caption}</Text>
      ) : null}
      {resource.sourceReference ? (
        <Text style={styles.source}>
          {resource.sourceReference.fileName}
          {resource.sourceReference.pageNumber
            ? `, p. ${resource.sourceReference.pageNumber}`
            : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroonFaint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.maroon,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 4,
  },
  source: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
