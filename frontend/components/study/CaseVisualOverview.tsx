import { Image } from 'expo-image';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ContentIllustration from '../media/ContentIllustration';
import { colors, layout } from '../../constants/theme';
import { mergeSectionVisuals, type SectionImageRef } from '../../services/content/sectionMedia';
import { getResourceAccessLabel, getResourceUrl } from '../../services/content/resourceLibrary';
import { resolveCurriculumImageSource } from '../../services/content/curriculumAssets';
import type { Mechanism } from '../../types/mechanism';
import type { Resource } from '../../types/resource';
import type { Section, SectionType } from '../../types/section';

const SECTION_LABELS: Record<SectionType, string> = {
  narrative: 'Narrative',
  histology: 'Histology',
  pathology: 'Pathology',
  physiology: 'Physiology',
  pharmacology: 'Pharmacology',
  mechanism: 'Mechanism',
  treatment: 'Treatment',
  clinicalPearl: 'Clinical Pearl',
};

export interface CaseVisualOverviewProps {
  sections: Section[];
  mechanisms: Mechanism[];
  resources: Resource[];
  onOpenSectionTab: (type: SectionType) => void;
  onOpenMechanisms: () => void;
  onOpenResources: () => void;
}

/**
 * Surfaces curriculum figures on the case overview so learners see visuals without hunting tabs.
 */
export default function CaseVisualOverview({
  sections,
  mechanisms,
  resources,
  onOpenSectionTab,
  onOpenMechanisms,
  onOpenResources,
}: CaseVisualOverviewProps) {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  const seenUrls = new Set<string>();
  const figureRows: Array<{
    key: string;
    section: Section;
    url: string;
    caption?: string;
    hotspots?: SectionImageRef['hotspots'];
    animation?: SectionImageRef['animation'];
  }> = [];

  for (const section of sortedSections) {
    const { images } = mergeSectionVisuals(section);
    let index = 0;
    for (const img of images) {
      if (!img.url || seenUrls.has(img.url)) continue;
      seenUrls.add(img.url);
      figureRows.push({
        key: `${section.id}_${index}`,
        section,
        url: img.url,
        caption: img.caption,
        hotspots: img.hotspots,
        animation: img.animation,
      });
      index += 1;
    }
  }

  const mechanismPreviews = mechanisms.filter((m) => m.diagramUrl && !seenUrls.has(m.diagramUrl));

  const resourceThumbs = resources.filter((r) => r.thumbnailUrl && getResourceUrl(r));

  const openResource = async (resource: Resource) => {
    const href = getResourceUrl(resource);
    if (!href) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    await Linking.openURL(href);
  };

  const hasAnyVisual =
    figureRows.length > 0 || mechanismPreviews.length > 0 || resourceThumbs.length > 0;

  if (!hasAnyVisual) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>Figures & media</Text>
        <Text style={styles.emptyBody}>
          This case does not include linked figures yet. Use the study tabs (Narrative, Pathology, Mechanisms,
          Resources) as content is added.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {figureRows.length > 0 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Key figures</Text>
          <Text style={styles.panelSubtitle}>From your study sections — tap a tab to read full notes.</Text>
          {figureRows.map((row, i) => (
            <View key={row.key} style={styles.figureBlock}>
              <View style={styles.figureMeta}>
                <Text style={styles.figureMetaLabel}>{SECTION_LABELS[row.section.type] ?? row.section.type}</Text>
                <Text style={styles.figureMetaTitle} numberOfLines={2}>
                  {row.section.title}
                </Text>
                <Pressable
                  onPress={() => onOpenSectionTab(row.section.type)}
                  style={styles.jumpLink}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${SECTION_LABELS[row.section.type]} section`}
                >
                  <Text style={styles.jumpLinkText}>Open {SECTION_LABELS[row.section.type]} tab →</Text>
                </Pressable>
              </View>
              <ContentIllustration
                url={row.url}
                caption={row.caption}
                animationIndex={i}
                hotspots={row.hotspots}
                animation={row.animation}
                compact
              />
            </View>
          ))}
        </View>
      ) : null}

      {mechanismPreviews.length > 0 ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Mechanism diagrams</Text>
          <Text style={styles.panelSubtitle}>Interactive steps live on the Mechanisms tab.</Text>
          {mechanismPreviews.map((mech, i) => (
            <View key={mech.id} style={styles.figureBlock}>
              <Text style={styles.mechanismTitle}>{mech.title}</Text>
              {mech.relatedDrug ? <Text style={styles.mechanismDrug}>Drug: {mech.relatedDrug}</Text> : null}
              <ContentIllustration
                url={mech.diagramUrl!}
                caption={mech.diagramCaption}
                animationIndex={figureRows.length + i}
                hotspots={mech.diagramHotspots}
                animation={mech.diagramAnimation}
                compact
              />
              <Pressable onPress={onOpenMechanisms} style={styles.jumpLink} accessibilityRole="button">
                <Text style={styles.jumpLinkText}>Open Mechanisms tab →</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {resourceThumbs.length > 0 ? (
        <View style={styles.panel}>
          <View style={styles.resourceHeaderRow}>
            <View style={styles.resourceHeaderText}>
              <Text style={styles.panelTitle}>Resource library</Text>
              <Text style={styles.panelSubtitle}>Thumbnails link to the PDF or chapter source.</Text>
            </View>
            <Pressable onPress={onOpenResources} style={styles.allResourcesBtn} accessibilityRole="button">
              <Text style={styles.allResourcesBtnText}>All resources →</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resourceRow}>
            {resourceThumbs.map((resource) => (
              <Pressable
                key={resource.id}
                onPress={() => void openResource(resource)}
                style={({ pressed }) => [styles.resourceCard, pressed && styles.resourceCardPressed]}
                accessibilityRole="button"
                accessibilityLabel={`Open ${resource.title}`}
              >
                {resource.thumbnailUrl ? (
                  <Image
                    source={resolveCurriculumImageSource(resource.thumbnailUrl)}
                    style={styles.resourceThumb}
                    contentFit="cover"
                    transition={180}
                  />
                ) : null}
                <View style={styles.resourceCardBody}>
                  <Text style={styles.resourceCardTitle} numberOfLines={2}>
                    {resource.title}
                  </Text>
                  <Text style={styles.resourceCardMeta}>{getResourceAccessLabel(resource)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 14,
    marginTop: 4,
  },
  panel: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.maroonDeep,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  figureBlock: {
    marginBottom: 18,
  },
  figureMeta: {
    marginBottom: 10,
  },
  figureMetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.maroon,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  figureMetaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  mechanismTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 4,
  },
  mechanismDrug: {
    fontSize: 13,
    color: colors.maroon,
    fontWeight: '600',
    marginBottom: 10,
  },
  jumpLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  jumpLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.maroon,
  },
  emptyPanel: {
    backgroundColor: colors.white,
    borderRadius: layout.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.maroonDeep,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  resourceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  resourceHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  allResourcesBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  allResourcesBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.maroon,
  },
  resourceRow: {
    gap: 12,
    paddingRight: 8,
  },
  resourceCard: {
    width: 200,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.cloud,
  },
  resourceCardPressed: {
    opacity: 0.92,
  },
  resourceThumb: {
    width: '100%',
    height: 100,
    backgroundColor: colors.cloudDark,
  },
  resourceCardBody: {
    padding: 10,
  },
  resourceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.maroonDeep,
    marginBottom: 4,
  },
  resourceCardMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.maroon,
  },
});
