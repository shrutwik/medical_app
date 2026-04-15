import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, shadows } from '../../constants/theme';

export function CardProgressTrack({ progress }: { progress?: number }) {
  if (progress === undefined || progress <= 0) return null;
  const pct = Math.min(100, Math.max(0, Math.round(progress)));
  return (
    <View style={sharedStyles.trackWrap}>
      <View style={sharedStyles.track}>
        <View style={[sharedStyles.fill, { width: `${pct}%` }]} />
      </View>
      <Text style={sharedStyles.pctLabel}>{pct}%</Text>
    </View>
  );
}

export const cardPressableBase = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  padding: 20,
  borderRadius: layout.radiusLg,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 12,
};

export const sharedStyles = StyleSheet.create({
  trackWrap: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.cloudDark,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.maroon,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.maroon,
    minWidth: 34,
    textAlign: 'right',
  },
  chevronWrap: {
    marginLeft: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.maroonFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexShrink: 0,
  },
  chevron: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.maroon,
  },
});

export function CardChevron() {
  return (
    <View style={sharedStyles.chevronWrap}>
      <Text style={sharedStyles.chevron}>→</Text>
    </View>
  );
}

export { shadows };
