import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { colors, layout } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

interface StudyScreenScrollProps extends Omit<ScrollViewProps, 'children'> {
  children: ReactNode;
}

/**
 * Standard study screen: full-height scroll, centered max width, responsive horizontal padding.
 */
export default function StudyScreenScroll({
  children,
  contentContainerStyle,
  style,
  ...rest
}: StudyScreenScrollProps) {
  const { isDesktop } = useResponsive();
  const pad = isDesktop ? layout.pagePaddingDesktop : layout.pagePadding;

  return (
    <ScrollView
      style={[styles.page, style]}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: pad,
          paddingBottom: layout.pageBottomPadding,
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          width: '100%',
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  content: {
    flexGrow: 1,
  },
});
