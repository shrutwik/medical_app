import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width } = useWindowDimensions();

  return {
    width,
    isDesktop: width >= 1100,
    isTablet: width >= 768,
    isMobile: width < 768,
    contentMaxWidth: width >= 1400 ? 900 : width >= 1100 ? 760 : width >= 768 ? 680 : width - 32,
  };
}
