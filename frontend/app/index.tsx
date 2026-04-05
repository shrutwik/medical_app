import { FlatList, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import SystemCard from '../components/cards/SystemCard';
import { getSystems } from '../services/data';

export default function Index() {
  const router = useRouter();
  const systems = getSystems();

  return (
    <>
      <Stack.Screen options={{ title: 'Systems' }} />
      <FlatList
        data={systems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SystemCard
            system={item}
            onPress={() => router.push(`/system/${item.id}`)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No systems available.</Text>}
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
