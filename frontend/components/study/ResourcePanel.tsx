import { StyleSheet, View } from 'react-native';
import type { Bookmark } from '../../types/study';
import type { Resource } from '../../types/resource';
import ResourceCard from '../cards/ResourceCard';

interface ResourcePanelProps {
  resources: Resource[];
  bookmarks: Bookmark[];
}

export default function ResourcePanel({
  resources,
  bookmarks,
}: ResourcePanelProps) {
  return (
    <View style={styles.container}>
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          bookmarked={bookmarks.some((item) => item.entityId === resource.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
