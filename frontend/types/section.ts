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
