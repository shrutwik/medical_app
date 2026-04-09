import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, layout } from '../../constants/theme';
import { getResourceAccessLabel, getResourceUrl } from '../../services/content/resourceLibrary';
import type { Resource } from '../../types/resource';

type RelatedResourceStripProps = {
  resources: Resource[];
};

/**
 * Inline “open source” chips for the active section tab (from data, not hardcoded).
 */
export default function RelatedResourceStrip({ resources }: RelatedResourceStripProps) {
  const open = async (resource: Resource) => {
    const href = getResourceUrl(resource);
    if (!href) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    await Linking.openURL(href);
  };

  const usable = resources.filter((r) => getResourceUrl(r));
  if (usable.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.delay(40).duration(320)} style={styles.block}>
      <Text style={styles.label}>Related sources</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {usable.map((resource, index) => (
          <Pressable
            key={resource.id}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() => open(resource)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${resource.title}`}
          >
            <Text style={styles.chipText} numberOfLines={2}>
              {resource.title}
            </Text>
            <Text style={styles.chipMeta}>{getResourceAccessLabel(resource)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.maroon,
    marginBottom: 10,
  },
  row: {
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    maxWidth: 220,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipPressed: {
    backgroundColor: colors.cloud,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.maroonDeep,
    marginBottom: 4,
  },
  chipMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
  },
});
