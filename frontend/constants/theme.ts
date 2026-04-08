import { Platform, StyleSheet } from 'react-native';

export const colors = {
  maroon: '#500000',
  maroonLight: '#6D2A2A',
  maroonFaint: '#F5EDED',
  maroonDeep: '#341010',
  white: '#FFFFFF',
  offWhite: '#F6F4F2',
  cloud: '#F3EFEB',
  cardBg: '#F6F1EE',
  cardBgStrong: '#EEE3DD',
  border: '#E4DED8',
  borderStrong: '#C9B8AE',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  slate: '#304050',
  slateLight: '#5B6B78',
  gold: '#C8873B',
  goldFaint: '#FFF4E8',
  success: '#2D8A4E',
  successBg: '#EDFAF1',
  error: '#C53030',
  errorBg: '#FFF0F0',
  accent: '#500000',
};

/** Layout and radii — use from screens/cards for consistency. */
export const layout = {
  pagePadding: 20,
  pagePaddingDesktop: 32,
  pageBottomPadding: 48,
  maxContentWidth: 1180,
  radiusSm: 12,
  radiusMd: 18,
  radiusLg: 24,
  radiusXl: 28,
  shellAccentHeight: 3,
};

export const typography = {
  heroTitle: { fontSize: 34, fontWeight: '800' as const, lineHeight: 40 },
  title: { fontSize: 26, fontWeight: '800' as const },
  section: { fontSize: 22, fontWeight: '800' as const },
  body: { fontSize: 15, lineHeight: 24 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6 },
};

const webCardShadow =
  Platform.OS === 'web'
    ? ({
        boxShadow: '0 2px 8px rgba(52, 16, 16, 0.06), 0 8px 24px rgba(52, 16, 16, 0.05)',
      } as const)
    : {};

export const shadows = StyleSheet.create({
  card: {
    ...webCardShadow,
    ...Platform.select({
      ios: {
        shadowColor: '#341010',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  shell: {
    ...Platform.select({
      web: {
        boxShadow: '0 1px 0 rgba(52, 16, 16, 0.06)',
      } as const,
      default: {},
    }),
  },
});
