import conditionsData from '../../mock/conditions.json';
import { Condition } from '../../types/condition';

export function getConditionsBySystem(systemId: string): Condition[] {
  return (conditionsData as Condition[]).filter((c) => c.systemId === systemId);
}

export function getConditionById(conditionId: string): Condition | undefined {
  return (conditionsData as Condition[]).find((c) => c.id === conditionId);
}
