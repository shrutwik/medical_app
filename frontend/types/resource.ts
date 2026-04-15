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
  externalUrl?: string;
  /** Optional preview image when the source is visual or you host a thumb. */
  thumbnailUrl?: string;
  tags: string[];
}
