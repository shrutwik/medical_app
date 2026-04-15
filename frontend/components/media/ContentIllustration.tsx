import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { IllustrationAnimation, IllustrationHotspot } from '../../types/mediaInteractive';
import { colors, layout } from '../../constants/theme';
import { resolveCurriculumImageSource } from '../../services/content/curriculumAssets';

export type ContentIllustrationProps = {
  url: string;
  caption?: string;
  /** Stagger index for entrance animation */
  animationIndex?: number;
  hotspots?: IllustrationHotspot[];
  animation?: IllustrationAnimation;
  /** Controlled highlight for synced lists / mechanism steps */
  activeHotspotId?: string | null;
  onHotspotPress?: (id: string) => void;
  /** Smaller frame for overview strips and dense layouts */
  compact?: boolean;
};

/**
 * Remote illustration from curriculum data (HTTPS). Fails gracefully if the URL breaks.
 * Optional normalized hotspots and animation metadata from offline/AI pipeline.
 */
export default function ContentIllustration({
  url,
  caption,
  animationIndex = 0,
  hotspots,
  animation,
  activeHotspotId: controlledActiveId,
  onHotspotPress,
  compact = false,
}: ContentIllustrationProps) {
  const [failed, setFailed] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);
  const [repairTried, setRepairTried] = useState(false);
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const [internalHotspotId, setInternalHotspotId] = useState<string | null>(null);
  const [animPlaying, setAnimPlaying] = useState(
    () => animation?.kind === 'gif' && animation.autoplay !== false,
  );

  const delay = Math.min(animationIndex * 70, 350);
  const repairedUrl = useMemo(() => toWikimediaOriginalAssetUrl(activeUrl), [activeUrl]);

  const activeHotspotId = controlledActiveId !== undefined ? controlledActiveId : internalHotspotId;

  const displayUri = useMemo(() => {
    if (animation?.kind === 'gif' && animPlaying && animation.url) return animation.url;
    return activeUrl;
  }, [animation, animPlaying, activeUrl]);

  const imageSource = useMemo(() => resolveCurriculumImageSource(displayUri), [displayUri]);

  useEffect(() => {
    setActiveUrl(url);
    setRepairTried(false);
    setFailed(false);
  }, [url]);

  useEffect(() => {
    setAnimPlaying(animation?.kind === 'gif' && animation.autoplay !== false);
  }, [animation]);

  const handleImageError = () => {
    if (typeof imageSource === 'number') {
      setFailed(true);
      return;
    }
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

  const openAnimationExternal = () => {
    if (animation?.url) void Linking.openURL(animation.url);
  };

  const onFrameLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: width, h: height });
  }, []);

  const handleHotspotPress = (id: string) => {
    if (onHotspotPress) onHotspotPress(id);
    else setInternalHotspotId((prev) => (prev === id ? null : id));
  };

  const activeHotspot = hotspots?.find((h) => h.id === activeHotspotId);

  const frameStyles = [styles.frame, compact && styles.frameCompact];
  const imageStyles = [styles.image, compact && styles.imageCompact];

  if (failed) {
    return (
      <Animated.View
        entering={FadeIn.delay(delay).duration(280)}
        style={[frameStyles, styles.fallback]}
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

  const showGifToggle =
    animation?.kind === 'gif' && animation.url && animation.url !== url && animation.autoplay === false;

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(380)} style={styles.wrap}>
      <View style={frameStyles} onLayout={onFrameLayout}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="image" accessibilityLabel={caption ?? 'Figure'}>
          <Image
            source={imageSource}
            style={imageStyles}
            contentFit="contain"
            transition={220}
            onError={handleImageError}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
        {layout.w > 0 &&
          layout.h > 0 &&
          hotspots?.map((h) => {
            const isActive = activeHotspotId === h.id;
            const baseStyle = {
              position: 'absolute' as const,
              borderWidth: 2,
              borderColor: isActive ? colors.maroon : 'rgba(255, 180, 60, 0.85)',
              backgroundColor: isActive ? 'rgba(128, 0, 0, 0.18)' : 'rgba(255, 200, 80, 0.12)',
            };
            if (h.shape === 'rect' && h.rect) {
              const { x, y, w, h: hh } = h.rect;
              const left = x * layout.w;
              const top = y * layout.h;
              const width = w * layout.w;
              const height = hh * layout.h;
              return (
                <Pressable
                  key={h.id}
                  accessibilityRole="button"
                  accessibilityLabel={h.label}
                  hitSlop={6}
                  onPress={() => handleHotspotPress(h.id)}
                  style={[
                    baseStyle,
                    {
                      left,
                      top,
                      width,
                      height,
                    },
                  ]}
                />
              );
            }
            if (h.shape === 'circle' && h.circle) {
              const { cx, cy, r } = h.circle;
              const dim = Math.min(layout.w, layout.h);
              const d = 2 * r * dim;
              const left = cx * layout.w - d / 2;
              const top = cy * layout.h - d / 2;
              return (
                <Pressable
                  key={h.id}
                  accessibilityRole="button"
                  accessibilityLabel={h.label}
                  hitSlop={6}
                  onPress={() => handleHotspotPress(h.id)}
                  style={[
                    baseStyle,
                    {
                      left,
                      top,
                      width: d,
                      height: d,
                      borderRadius: d / 2,
                    },
                  ]}
                />
              );
            }
            return null;
          })}
      </View>

      {showGifToggle ? (
        <Pressable onPress={() => setAnimPlaying((p) => !p)} style={styles.animToggle}>
          <Text style={styles.animToggleText}>{animPlaying ? 'Show still image' : 'Play animation'}</Text>
        </Pressable>
      ) : null}

      {animation?.kind === 'video' || animation?.kind === 'lottie' ? (
        <Pressable onPress={openAnimationExternal} style={styles.externalAnim}>
          <Text style={styles.externalAnimText}>
            Open {animation.kind === 'lottie' ? 'Lottie' : 'video'} animation
          </Text>
        </Pressable>
      ) : null}

      {activeHotspot ? (
        <View style={styles.callout} accessibilityRole="text">
          <Text style={styles.calloutTitle}>{activeHotspot.label}</Text>
          {activeHotspot.description ? (
            <Text style={styles.calloutBody}>{activeHotspot.description}</Text>
          ) : null}
        </View>
      ) : null}

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
    position: 'relative',
  },
  frameCompact: {
    minHeight: 120,
    maxHeight: 280,
  },
  image: {
    width: '100%',
    height: 240,
  },
  imageCompact: {
    height: 200,
  },
  animToggle: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.maroonFaint,
  },
  animToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.maroon,
  },
  externalAnim: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  externalAnimText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.maroon,
    textDecorationLine: 'underline',
  },
  callout: {
    marginTop: 10,
    padding: 12,
    borderRadius: layout.radiusMd,
    backgroundColor: colors.maroonFaint,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  calloutBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
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
