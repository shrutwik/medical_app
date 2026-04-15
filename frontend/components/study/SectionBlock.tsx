import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ContentIllustration from '../media/ContentIllustration';
import RelatedResourceStrip from '../media/RelatedResourceStrip';
import type { Resource } from '../../types/resource';
import type { Section } from '../../types/section';
import { colors, layout } from '../../constants/theme';
import { mergeSectionVisuals } from '../../services/content/sectionMedia';

// Color accent per section type
const SECTION_ACCENT: Record<string, { color: string; bg: string; label: string }> = {
  narrative:    { color: colors.maroon,   bg: colors.maroonFaint,  label: 'Clinical Narrative' },
  histology:    { color: '#7A3C1C',       bg: '#FFF4EE',           label: 'Histology' },
  pathology:    { color: '#1C4A7A',       bg: '#EFF4FF',           label: 'Pathology' },
  physiology:   { color: '#1A6B3A',       bg: '#F0FFF5',           label: 'Physiology' },
  pharmacology: { color: '#4A1C7A',       bg: '#F5F0FF',           label: 'Pharmacology' },
  mechanism:    { color: colors.goldDeep, bg: colors.goldFaint,    label: 'Mechanism' },
  treatment:    { color: '#1C5A7A',       bg: '#EFF9FF',           label: 'Treatment' },
  clinicalPearl:{ color: colors.gold,     bg: colors.goldFaint,    label: 'Clinical Pearl' },
};

interface SectionBlockProps {
  section: Section;
  completed: boolean;
  relatedResources?: Resource[];
}

export default function SectionBlock({ section, completed, relatedResources }: SectionBlockProps) {
  const { text, images } = mergeSectionVisuals(section);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const hasHotspots = images.some((img) => (img.hotspots?.length ?? 0) > 0);
  const accent = SECTION_ACCENT[section.type] ?? { color: colors.maroon, bg: colors.maroonFaint, label: section.type };

  return (
    <View style={styles.card}>
      {/* Accent header */}
      <View style={[styles.header, { backgroundColor: accent.bg, borderLeftColor: accent.color }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.eyebrow, { color: accent.color }]}>{accent.label}</Text>
          <Text style={styles.title}>{section.title}</Text>
        </View>
        <View style={[styles.statusPill, completed ? styles.statusPillDone : { borderColor: accent.color + '40', backgroundColor: 'transparent' }]}>
          <Text style={[styles.statusText, completed ? styles.statusTextDone : { color: accent.color }]}>
            {completed ? '✓ Reviewed' : 'In focus'}
          </Text>
        </View>
      </View>

      {/* Media and resources */}
      {relatedResources && relatedResources.length > 0 ? (
        <View style={styles.resourcesWrap}>
          <RelatedResourceStrip resources={relatedResources} />
        </View>
      ) : null}

      {images.map((item, index) => (
        <ContentIllustration
          key={`${item.url}_${index}`}
          url={item.url}
          caption={item.caption}
          animationIndex={index}
          hotspots={item.hotspots}
          animation={item.animation}
          activeHotspotId={hasHotspots ? activeHotspotId : undefined}
          onHotspotPress={hasHotspots ? (id) => setActiveHotspotId(id) : undefined}
        />
      ))}

      {hasHotspots ? (
        <View style={styles.hotspotLegend}>
          <Text style={styles.hotspotLegendTitle}>Explore the figure</Text>
          <View style={styles.hotspotChips}>
            {images.flatMap((img) => img.hotspots ?? []).map((h) => (
              <Pressable
                key={h.id}
                onPress={() => setActiveHotspotId(h.id)}
                style={[styles.hotspotChip, activeHotspotId === h.id && styles.hotspotChipActive]}
              >
                <Text style={[styles.hotspotChipText, activeHotspotId === h.id && styles.hotspotChipTextActive]}>
                  {h.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Body text */}
      <View style={styles.body}>
        <Text style={styles.content}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    padding: 18,
    paddingBottom: 16,
    borderLeftWidth: 3,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 5,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: -0.1,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusPillDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextDone: {
    color: colors.success,
  },
  resourcesWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  body: {
    padding: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  content: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 28,
    fontWeight: '400',
  },
  hotspotLegend: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hotspotLegendTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  hotspotChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hotspotChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cloud,
  },
  hotspotChipActive: {
    borderColor: colors.maroon,
    backgroundColor: colors.maroonFaint,
  },
  hotspotChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  hotspotChipTextActive: {
    color: colors.maroon,
  },
});
