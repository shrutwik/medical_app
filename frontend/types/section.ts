import type { IllustrationAnimation, IllustrationHotspot } from './mediaInteractive';

export type SectionType =
  | 'narrative'
  | 'histology'
  | 'pathology'
  | 'physiology'
  | 'pharmacology'
  | 'mechanism'
  | 'treatment'
  | 'clinicalPearl';

export interface SectionIllustration {
  url: string;
  caption?: string;
  /** Interactive regions (normalized coords). */
  hotspots?: IllustrationHotspot[];
  /** Optional animation asset (GIF/Lottie/video URL). */
  animation?: IllustrationAnimation;
}

export interface Section {
  id: string;
  caseId: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  tags: string[];
  /** Optional figures (HTTPS URLs from curriculum data). */
  illustrations?: SectionIllustration[];
}
