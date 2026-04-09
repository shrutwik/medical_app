import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Resource } from '../../types/resource';
import { colors } from '../../constants/theme';
import { getResourceAccessLabel, getResourceUrl } from '../../services/content/resourceLibrary';

interface ResourceCardProps {
  resource: Resource;
  bookmarked?: boolean;
}

export default function ResourceCard({
  resource,
  bookmarked = false,
}: ResourceCardProps) {
  const resourceUrl = getResourceUrl(resource);
  const openResource = async () => {
    if (!resourceUrl) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(resourceUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    await Linking.openURL(resourceUrl);
  };

  return (
    <View style={styles.container}>
      {resource.thumbnailUrl ? (
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: resource.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        </View>
      ) : null}
      <View style={styles.topRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{resource.type}</Text>
        </View>
        {bookmarked ? (
          <View style={styles.savedBadge}>
            <Text style={styles.savedText}>Saved</Text>
          </View>
        ) : null}
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
      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryButton, !resourceUrl && styles.primaryButtonDisabled]}
          onPress={openResource}
          disabled={!resourceUrl}
        >
          <Text style={styles.primaryButtonText}>{getResourceAccessLabel(resource)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumbWrap: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    height: 140,
    backgroundColor: colors.cloud,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroonFaint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.maroon,
    textTransform: 'uppercase',
  },
  savedBadge: {
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savedText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
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
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
