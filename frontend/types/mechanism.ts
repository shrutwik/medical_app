import type { IllustrationAnimation, IllustrationHotspot } from './mediaInteractive';

export interface MechanismStep {
  stepNumber: number;
  label: string;
  description: string;
  illustrationUrl?: string;
  illustrationCaption?: string;
  /** When set, highlights the diagram hotspot with this id when the step is active. */
  hotspotId?: string;
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
  /** Hotspots on the overview diagram (normalized coords). */
  diagramHotspots?: IllustrationHotspot[];
  diagramAnimation?: IllustrationAnimation;
}
