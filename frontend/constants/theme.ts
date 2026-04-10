import { Platform, StyleSheet } from 'react-native';

export const colors = {
  // Brand
  maroon: '#5C0000',
  maroonLight: '#7A2E2E',
  maroonFaint: '#F7EEEE',
  maroonDeep: '#2E0A0A',
  maroonMid: '#8B3030',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8F5F2',
  cloud: '#F2EDE8',
  cloudDark: '#E8DFD8',
  cardBg: '#FAF7F5',
  cardBgStrong: '#EDE4DC',
  border: '#E6DDD6',
  borderStrong: '#C9B8AE',

  // Text
  textPrimary: '#1C1410',
  textSecondary: '#5C4F47',
  textMuted: '#9A8880',
  textOnDark: '#FFFFFF',

  // Accent
  gold: '#C07030',
  goldBright: '#D4892E',
  goldFaint: '#FFF5E8',
  goldDeep: '#8B4E12',

  // Semantic
  success: '#1E7A45',
  successBg: '#E8F7EE',
  successBorder: '#A3D9B8',
  error: '#C53030',
  errorBg: '#FFF0F0',
  errorBorder: '#F5AAAA',
  warning: '#B86000',
  warningBg: '#FFF8E8',

  // System track colors (accent left-border per track)
  trackCardio: '#7A1C1C',
  trackResp: '#1C4A7A',
  trackNeuro: '#4A1C7A',
  trackGI: '#1A6B3A',
  trackEndo: '#7A5A1C',
  trackRenal: '#1C5A7A',
  trackMuscle: '#5A3A1C',

  // Misc
  slate: '#2C3E50',
  slateLight: '#5B6B78',
  accent: '#5C0000',

  // Overlay/glass
  glass: 'rgba(255,255,255,0.7)',
  overlay: 'rgba(46,10,10,0.06)',
};

export const layout = {
  pagePadding: 20,
  pagePaddingDesktop: 40,
  pageBottomPadding: 56,
  maxContentWidth: 1200,
  radiusSm: 10,
  radiusMd: 16,
  radiusLg: 22,
  radiusXl: 28,
  radius2xl: 36,
  shellAccentHeight: 3,
};

export const typography = {
  heroTitle: { fontSize: 36, fontWeight: '800' as const, lineHeight: 42, letterSpacing: -0.5 },
  title: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  section: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.2 },
  cardTitle: { fontSize: 19, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 26 },
  bodyLg: { fontSize: 16, lineHeight: 28 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  caption: { fontSize: 12, lineHeight: 18 },
};

// Richer, layered shadows
const webShadow = (y: number, blur: number, spread: number, opacity: number) =>
  Platform.OS === 'web'
    ? ({
        boxShadow: `0 ${y}px ${blur}px rgba(46, 10, 10, ${opacity * 0.5}), 0 ${Math.round(y * 0.3)}px ${Math.round(blur * 0.4)}px rgba(46, 10, 10, ${opacity * 0.3})`,
      } as const)
    : {};

export const shadows = StyleSheet.create({
  card: {
    ...webShadow(4, 16, 0, 0.12),
    ...Platform.select({
      ios: {
        shadowColor: '#2E0A0A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.09,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  cardHover: {
    ...webShadow(8, 28, 0, 0.15),
    ...Platform.select({
      ios: {
        shadowColor: '#2E0A0A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.13,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  shell: {
    ...Platform.select({
      web: {
        boxShadow: '0 1px 0 rgba(46, 10, 10, 0.08)',
      } as const,
      default: {},
    }),
  },
  subtle: {
    ...webShadow(2, 8, 0, 0.07),
    ...Platform.select({
      ios: {
        shadowColor: '#2E0A0A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
});
