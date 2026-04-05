export interface Case {
  id: string;
  conditionId: string;
  title: string;
  shortDescription: string;
  difficulty: string;
  tags: string[];
}

export interface CaseVitals {
  [key: string]: string | number | undefined;
}

export interface ClinicalNarrative {
  presentation: string;
  history: string;
  vitals: CaseVitals;
  exam: string;
  discussionPrompts: string[];
}

export interface DiagnosticTest {
  name: string;
  result: string;
  interpretation: string;
}

export interface CaseDiagnosis {
  name: string;
  keyFindings: string[];
  tests: DiagnosticTest[];
}

export interface CaseMedication {
  name: string;
  class: string;
  role: string;
}

export interface CaseTreatment {
  plan: string;
  medications: CaseMedication[];
  followUp: string;
  outcome: string;
}

export interface CaseDetail {
  caseId: string;
  clinicalNarrative: ClinicalNarrative;
  diagnosis: CaseDiagnosis;
  treatment: CaseTreatment;
}
