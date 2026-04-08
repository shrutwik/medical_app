import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import DesktopAppShell from '../components/navigation/DesktopAppShell';
import { colors } from '../constants/theme';
import { BreadcrumbProvider } from '../contexts/BreadcrumbContext';

function LayoutBody() {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === 'web' && width >= 1100;

  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.offWhite, flex: 1 },
      }}
    />
  );

  if (isDesktopWeb) {
    return <DesktopAppShell>{stack}</DesktopAppShell>;
  }

  return stack;
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const html = document.documentElement;
    const body = document.body;
    const root =
      document.getElementById('root') ??
      document.getElementById('__next') ??
      document.querySelector('#app');

    const previous = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyMinHeight: body.style.minHeight,
      rootOverflow: root instanceof HTMLElement ? root.style.overflow : '',
      rootHeight: root instanceof HTMLElement ? root.style.height : '',
      rootMinHeight: root instanceof HTMLElement ? root.style.minHeight : '',
    };

    html.style.height = '100%';
    html.style.overflow = 'auto';
    body.style.height = '100%';
    body.style.minHeight = '100%';
    body.style.overflow = 'auto';

    if (root instanceof HTMLElement) {
      root.style.height = '100%';
      root.style.minHeight = '100%';
      root.style.overflow = 'auto';
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.height = previous.htmlHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;
      body.style.minHeight = previous.bodyMinHeight;

      if (root instanceof HTMLElement) {
        root.style.overflow = previous.rootOverflow;
        root.style.height = previous.rootHeight;
        root.style.minHeight = previous.rootMinHeight;
      }
    };
  }, []);

  return (
    <BreadcrumbProvider>
      <LayoutBody />
    </BreadcrumbProvider>
  );
}
