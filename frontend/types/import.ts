import type { CaseDetail } from './case';
import type { StudyCheckpoint } from './checkpoint';
import type { Condition } from './condition';
import type { Mechanism } from './mechanism';
import type { QuizQuestion } from './quiz';
import type { Resource } from './resource';
import type { Section, SectionType } from './section';
import type { PublishStatus } from './study';
import type { System } from './system';

export type ImportContentType =
  | 'section'
  | 'quiz'
  | 'checkpoint'
  | 'resource'
  | 'mechanism';

export interface ImportBatchMeta {
  batchId: string;
  title: string;
  defaultPublishStatus?: PublishStatus;
  defaultDifficulty?: string;
}

export interface ImportCaseRecord {
  id?: string;
  conditionRef: string;
  title: string;
  shortDescription: string;
  difficulty?: string;
  tags?: string[] | string;
  publishStatus?: PublishStatus;
  isFoundationCase?: boolean;
}

export interface RawSourceItem {
  sourceId?: string;
  contentType: ImportContentType;
  title?: string;
  prompt?: string;
  body?: string;
  explanation?: string;
  hint?: string;
  options?: string[] | string;
  answerIndex?: number;
  tags?: string[] | string;
  systemRef?: string;
  conditionRef?: string;
  caseRef?: string;
  targetTab?: string;
  sectionType?: SectionType;
  order?: number;
  resourceType?: string;
  caption?: string;
  sourceType?: string;
  sourceFileName?: string;
  sourcePageNumber?: number;
  assetKey?: string;
  externalUrl?: string;
  relatedDrug?: string;
  steps?: Array<{
    stepNumber?: number;
    label: string;
    description: string;
  }>;
}

export interface MappedSourceItem extends RawSourceItem {
  id: string;
  caseId?: string;
  conditionId?: string;
  systemId?: string;
  resolved: boolean;
}

export interface ImportIssue {
  level: 'error' | 'warning';
  code:
    | 'missing_required_field'
    | 'missing_system'
    | 'missing_condition'
    | 'missing_case'
    | 'missing_foundation_case'
    | 'invalid_quiz'
    | 'duplicate_id'
    | 'unsupported_content_type';
  message: string;
  sourceId?: string;
  itemTitle?: string;
}

export interface ImportBatch {
  meta: ImportBatchMeta;
  systems: System[];
  conditions: Condition[];
  cases: ImportCaseRecord[];
  caseDetails: CaseDetail[];
  sourceItems: RawSourceItem[];
}

export interface ImportOutputTables {
  systems: System[];
  conditions: Condition[];
  cases: Array<ImportCaseRecord & { id: string; publishStatus: PublishStatus; difficulty: string }>;
  caseDetails: CaseDetail[];
  sections: Section[];
  mechanisms: Mechanism[];
  resources: Resource[];
  quizzes: QuizQuestion[];
  checkpoints: StudyCheckpoint[];
}

export interface ImportReport {
  batchId: string;
  title: string;
  generatedAt: string;
  summary: {
    systems: number;
    conditions: number;
    cases: number;
    caseDetails: number;
    sections: number;
    mechanisms: number;
    resources: number;
    quizzes: number;
    checkpoints: number;
    issues: number;
    unresolvedItems: number;
  };
  issues: ImportIssue[];
  unresolvedItems: MappedSourceItem[];
}

export interface ImportBatchOutputCounts {
  sourceFiles: number;
  systems: number;
  conditions: number;
  cases: number;
  caseDetails: number;
  sections: number;
  mechanisms: number;
  resources: number;
  quizzes: number;
  checkpoints: number;
}

export type ImportBatchStatus =
  | 'incomplete'
  | 'not_generated'
  | 'blocked'
  | 'warning'
  | 'ready';

export interface ImportBatchSummary {
  batchId: string;
  title: string;
  folderName: string;
  generatedAt?: string;
  sourceFileCount: number;
  errorCount: number;
  warningCount: number;
  unresolvedItemCount: number;
  outputCounts: ImportBatchOutputCounts;
  status: ImportBatchStatus;
}

export interface ImportBatchState extends ImportBatchSummary {
  hasOutput: boolean;
  hasReport: boolean;
  loadable: boolean;
  notesPath?: string;
  report?: ImportReport;
}

export interface ImportBatchActionResult {
  batch: ImportBatchState;
  message: string;
}
