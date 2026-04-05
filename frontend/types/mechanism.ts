export interface MechanismStep {
  stepNumber: number;
  label: string;
  description: string;
}

export interface Mechanism {
  id: string;
  caseId: string;
  title: string;
  relatedDrug: string;
  steps: MechanismStep[];
}
