export interface MechanismStep {
  stepNumber: number;
  label: string;
  description: string;
  illustrationUrl?: string;
  illustrationCaption?: string;
}

export interface Mechanism {
  id: string;
  caseId: string;
  title: string;
  relatedDrug: string;
  steps: MechanismStep[];
  /** Optional overview diagram (HTTPS URL from curriculum data). */
  diagramUrl?: string;
  diagramCaption?: string;
}
