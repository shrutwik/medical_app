import { StyleSheet, Text, View } from 'react-native';
import ContentIllustration from '../media/ContentIllustration';
import RelatedResourceStrip from '../media/RelatedResourceStrip';
import type { Resource } from '../../types/resource';
import type { Section } from '../../types/section';
import { colors } from '../../constants/theme';
import { mergeSectionVisuals } from '../../services/content/sectionMedia';

interface SectionBlockProps {
  section: Section;
  completed: boolean;
  /** Resources tagged for this section type in the same case (from data). */
  relatedResources?: Resource[];
}

export default function SectionBlock({ section, completed, relatedResources }: SectionBlockProps) {
  const { text, images } = mergeSectionVisuals(section);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{section.type}</Text>
          <Text style={styles.title}>{section.title}</Text>
        </View>
        <View style={[styles.statusPill, completed && styles.statusPillDone]}>
          <Text style={[styles.statusText, completed && styles.statusTextDone]}>
            {completed ? 'Saved' : 'In focus'}
          </Text>
        </View>
      </View>

      {relatedResources && relatedResources.length > 0 ? (
        <RelatedResourceStrip resources={relatedResources} />
      ) : null}

      {images.map((item, index) => (
        <ContentIllustration
          key={`${item.url}_${index}`}
          url={item.url}
          caption={item.caption}
          animationIndex={index}
        />
      ))}

      <Text style={styles.content}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  statusPill: {
    backgroundColor: colors.maroonFaint,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillDone: {
    backgroundColor: colors.successBg,
  },
  statusText: {
    color: colors.maroon,
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextDone: {
    color: colors.success,
  },
  content: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 26,
  },
});
