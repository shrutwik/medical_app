import { CURRICULUM_ASSET_MAP } from '../../assets/curriculum/assetMap.generated';

/**
 * Resolved source for expo-image / Image: bundled module id or remote URI.
 */
export type CurriculumImageSource = number | { uri: string };

/**
 * Prefer a downloaded curriculum asset when the dataset URL was mirrored into assets/curriculum/.
 */
export function resolveCurriculumImageSource(uri: string | undefined | null): CurriculumImageSource {
  if (!uri) return { uri: '' };
  const local = CURRICULUM_ASSET_MAP[uri];
  if (local !== undefined) return local;
  return { uri };
}

export function hasBundledCurriculumAsset(uri: string | undefined | null): boolean {
  if (!uri) return false;
  return CURRICULUM_ASSET_MAP[uri] !== undefined;
}
