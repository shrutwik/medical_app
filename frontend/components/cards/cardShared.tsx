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
  padding: 18,
  borderRadius: layout.radiusMd,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 14,
};

export const sharedStyles = StyleSheet.create({
  trackWrap: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.cloud,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.maroon,
  },
  pctLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.maroon,
    minWidth: 34,
    textAlign: 'right',
  },
  chevronWrap: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.maroonFaint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chevron: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.maroon,
    marginTop: -1,
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
