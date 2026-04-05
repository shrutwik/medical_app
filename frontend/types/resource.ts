export interface SourceReference {
  fileName: string;
  pageNumber: number;
}

export interface Resource {
  id: string;
  caseId: string;
  sectionType: string;
  type: string;
  title: string;
  description: string;
  caption: string;
  sourceType: string;
  sourceReference: SourceReference;
  assetKey: string;
  tags: string[];
}
