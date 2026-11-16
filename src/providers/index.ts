/**
 * Provider registry.
 *
 * Adding a new free-tier provider = add one entry here + one adapter module.
 * The UI consumes this list for the settings dropdown.
 */

import type { ProviderAdapter, ProviderInfo } from '../types'
import { audDAdapter } from './aud-d'
import { acrCloudAdapter } from './acrcloud'
import { rapidApiShazamAdapter } from './rapidapi-shazam'

export const PROVIDERS: ProviderAdapter[] = [audDAdapter, acrCloudAdapter, rapidApiShazamAdapter]

export const PROVIDER_LIST: ProviderInfo[] = PROVIDERS.map((p) => p.info)

export function getProvider(id: string): ProviderAdapter | undefined {
  return PROVIDERS.find((p) => p.info.id === id)
}

export function getProviderInfo(id: string): ProviderInfo | undefined {
  return PROVIDER_LIST.find((p) => p.id === id)
}

export { audDAdapter, acrCloudAdapter, rapidApiShazamAdapter }