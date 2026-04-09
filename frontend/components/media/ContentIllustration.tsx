import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, layout } from '../../constants/theme';

type ContentIllustrationProps = {
  url: string;
  caption?: string;
  /** Stagger index for entrance animation */
  animationIndex?: number;
};

/**
 * Remote illustration from curriculum data (HTTPS). Fails gracefully if the URL breaks.
 */
export default function ContentIllustration({ url, caption, animationIndex = 0 }: ContentIllustrationProps) {
  const [failed, setFailed] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);
  const [repairTried, setRepairTried] = useState(false);
  const delay = Math.min(animationIndex * 70, 350);
  const repairedUrl = useMemo(() => toWikimediaOriginalAssetUrl(activeUrl), [activeUrl]);

  useEffect(() => {
    setActiveUrl(url);
    setRepairTried(false);
    setFailed(false);
  }, [url]);

  const handleImageError = () => {
    if (!repairTried && repairedUrl && repairedUrl !== activeUrl) {
      setRepairTried(true);
      setActiveUrl(repairedUrl);
      return;
    }
    setFailed(true);
  };

  const openExternal = () => {
    void Linking.openURL(url);
  };

  if (failed) {
    return (
      <Animated.View
        entering={FadeIn.delay(delay).duration(280)}
        style={[styles.frame, styles.fallback]}
      >
        <Pressable onPress={openExternal} accessibilityRole="link">
        <Text style={styles.fallbackTitle}>Preview unavailable</Text>
        <Text style={styles.fallbackUrl} numberOfLines={2}>
          {url}
        </Text>
        <Text style={styles.fallbackHint}>Tap to open source image</Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(380)} style={styles.wrap}>
      <Pressable style={styles.frame} accessibilityRole="image" accessibilityLabel={caption ?? 'Figure'}>
        <Image
          source={{ uri: activeUrl }}
          style={styles.image}
          contentFit="contain"
          transition={220}
          onError={handleImageError}
          accessibilityIgnoresInvertColors
        />
      </Pressable>
      {caption ? (
        <Text style={styles.caption} accessibilityRole="text">
          {caption}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  frame: {
    borderRadius: layout.radiusMd,
    backgroundColor: colors.cloud,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 160,
    maxHeight: 320,
  },
  image: {
    width: '100%',
    height: 240,
  },
  caption: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  fallback: {
    padding: 16,
    justifyContent: 'center',
    minHeight: 100,
  },
  fallbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  fallbackUrl: {
    fontSize: 11,
    color: colors.textMuted,
  },
  fallbackHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.maroon,
    textDecorationLine: 'underline',
  },
});

function toWikimediaOriginalAssetUrl(value: string): string | undefined {
  try {
    const parsed = new URL(value);
    if (parsed.hostname !== 'upload.wikimedia.org') return undefined;
    if (!parsed.pathname.includes('/wikipedia/commons/thumb/')) return undefined;

    const parts = parsed.pathname.split('/');
    if (parts.length < 3) return undefined;
    // Remove the trailing "<size>-File.ext" segment and drop "/thumb".
    parts.pop();
    const thumbIndex = parts.indexOf('thumb');
    if (thumbIndex === -1) return undefined;
    parts.splice(thumbIndex, 1);
    parsed.pathname = parts.join('/');
    return parsed.toString();
  } catch {
    return undefined;
  }
}
