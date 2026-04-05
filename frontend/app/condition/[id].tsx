import { FlatList, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import CaseCard from '../../components/cards/CaseCard';
import { getCasesByCondition } from '../../services/data';

export default function ConditionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cases = getCasesByCondition(id ?? '');

  return (
    <>
      <Stack.Screen options={{ title: 'Cases' }} />
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CaseCard
            caseItem={item}
            onPress={() => router.push(`/case/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cases found.</Text>}
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
