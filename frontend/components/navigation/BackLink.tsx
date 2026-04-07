import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface BackLinkProps {
  label: string;
  onPress: () => void;
}

export default function BackLink({ label, onPress }: BackLinkProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{`< Back to ${label}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cloud,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.maroon,
    fontSize: 12,
    fontWeight: '700',
  },
});
