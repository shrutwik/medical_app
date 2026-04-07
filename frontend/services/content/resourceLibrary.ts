import asthmaMedicationsPdf from '../../imports/respiratory-resource-batch/source/Asthma Medications _ Treatment & Management _ Point of Care_StatPearls.pdf';
import asthmaSlideDeckPptx from '../../imports/respiratory-resource-batch/source/Asthma case and Albuterol (1).pptx';
import beta2Pdf from '../../imports/respiratory-resource-batch/source/Beta2-Receptor Agonists and Antagonists - StatPearls - NCBI Bookshelf.pdf';
import chapter39Pdf from '../../imports/respiratory-resource-batch/source/Chapter 39 Drugs against Asthma.pdf';
import histologyPdf from '../../imports/respiratory-resource-batch/source/Histology, Lung - StatPearls - NCBI Bookshelf.pdf';
import pathophysiologyPdf from '../../imports/respiratory-resource-batch/source/Pathophysiology Of Asthma _ Treatment & Management _ Point of Care - StatPearls.pdf';
import physiologyPdf from '../../imports/respiratory-resource-batch/source/Physiology, Lung - StatPearls - NCBI Bookshelf.pdf';
import questionsPdf from '../../imports/respiratory-resource-batch/source/Questions on Respiration.pdf';
import step1Pdf from '../../imports/respiratory-resource-batch/source/STEP 1 Respiratory Questions.pdf';
import type { Resource } from '../../types/resource';

const resourceFilesByName: Record<string, string> = {
  'Asthma Medications _ Treatment & Management _ Point of Care_StatPearls.pdf': asthmaMedicationsPdf,
  'Asthma case and Albuterol (1).pptx': asthmaSlideDeckPptx,
  'Beta2-Receptor Agonists and Antagonists - StatPearls - NCBI Bookshelf.pdf': beta2Pdf,
  'Chapter 39 Drugs against Asthma.pdf': chapter39Pdf,
  'Histology, Lung - StatPearls - NCBI Bookshelf.pdf': histologyPdf,
  'Pathophysiology Of Asthma _ Treatment & Management _ Point of Care - StatPearls.pdf': pathophysiologyPdf,
  'Physiology, Lung - StatPearls - NCBI Bookshelf.pdf': physiologyPdf,
  'Questions on Respiration.pdf': questionsPdf,
  'STEP 1 Respiratory Questions.pdf': step1Pdf,
};

export function getResourceUrl(resource: Resource) {
  if (resource.externalUrl) return resource.externalUrl;

  const localFile = resourceFilesByName[resource.sourceReference?.fileName];
  if (!localFile) return undefined;

  if (resource.sourceType === 'pdf' && resource.sourceReference?.pageNumber) {
    return `${localFile}#page=${resource.sourceReference.pageNumber}`;
  }

  return localFile;
}

export function getResourceAccessLabel(resource: Resource) {
  if (resource.externalUrl) return 'Open external source';
  if (getResourceUrl(resource)) {
    return resource.sourceType === 'pptx' ? 'Open slides' : 'Open source';
  }
  return 'Source unavailable';
}
