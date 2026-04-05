import resourcesData from '../../mock/resources.json';
import { Resource } from '../../types/resource';

export function getResourcesByCase(caseId: string): Resource[] {
  return (resourcesData as Resource[]).filter((r) => r.caseId === caseId);
}
