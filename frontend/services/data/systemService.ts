import systemsData from '../../mock/systems.json';
import { System } from '../../types/system';

export function getSystems(): System[] {
  return systemsData as System[];
}
