export type SectionType =
  | 'narrative'
  | 'histology'
  | 'pathology'
  | 'physiology'
  | 'pharmacology'
  | 'mechanism'
  | 'treatment'
  | 'clinicalPearl';

export interface Section {
  id: string;
  caseId: string;
  type: SectionType;
  title: string;
  content: string;
  order: number;
  tags: string[];
}
