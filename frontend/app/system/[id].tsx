import { FlatList, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import ConditionCard from '../../components/cards/ConditionCard';
import { getConditionsBySystem } from '../../services/data';

export default function SystemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const conditions = getConditionsBySystem(id ?? '');

  return (
    <>
      <Stack.Screen options={{ title: 'Conditions' }} />
      <FlatList
        data={conditions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ConditionCard
            condition={item}
            onPress={() => router.push(`/condition/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No conditions found.</Text>}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
});
