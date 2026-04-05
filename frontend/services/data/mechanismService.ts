import mechanismsData from '../../mock/mechanisms.json';
import { Mechanism } from '../../types/mechanism';

export function getMechanismsByCase(caseId: string): Mechanism[] {
  return (mechanismsData as Mechanism[]).filter((m) => m.caseId === caseId);
}
