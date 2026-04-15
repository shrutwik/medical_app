import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout } from '../constants/theme';

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{this.state.message || 'An unexpected error occurred.'}</Text>
            <Pressable
              style={styles.button}
              onPress={() => this.setState({ hasError: false, message: '' })}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    padding: layout.pagePadding,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusXl,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 480,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.maroon,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
