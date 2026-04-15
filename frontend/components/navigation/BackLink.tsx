import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout } from '../../constants/theme';

interface BackLinkProps {
  label: string;
  onPress: () => void;
}

export default function BackLink({ label, onPress }: BackLinkProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={`Back to ${label}`}
    >
      <Text style={styles.text}>{`← ${label}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: layout.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.cloud,
  },
  text: {
    color: colors.maroonDeep,
    fontSize: 13,
    fontWeight: '700',
  },
});
