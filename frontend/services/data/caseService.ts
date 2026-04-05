import casesData from '../../mock/cases.json';
import caseDetailsData from '../../mock/case_details.json';
import { Case, CaseDetail } from '../../types/case';

export function getCasesByCondition(conditionId: string): Case[] {
  return (casesData as Case[]).filter((c) => c.conditionId === conditionId);
}

export function getCaseById(caseId: string): Case | undefined {
  return (casesData as Case[]).find((c) => c.id === caseId);
}

export function getCaseDetails(caseId: string): CaseDetail | undefined {
  return (caseDetailsData as CaseDetail[]).find((d) => d.caseId === caseId);
}
