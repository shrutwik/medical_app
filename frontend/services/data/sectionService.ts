import sectionsData from '../../mock/sections.json';
import { Section } from '../../types/section';

export function getSectionsByCase(caseId: string): Section[] {
  return (sectionsData as Section[])
    .filter((s) => s.caseId === caseId)
    .sort((a, b) => a.order - b.order);
}
