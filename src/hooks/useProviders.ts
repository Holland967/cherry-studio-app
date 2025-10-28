import { useLiveQuery } from 'drizzle-orm/expo-sqlite'
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { loggerService } from '@/services/LoggerService'
import { providerService } from '@/services/ProviderService'
import type { Provider } from '@/types/assistant'

import { db } from '@db'
import { transformDbToProvider } from '@db/mappers'
import { providers as providersSchema } from '@db/schema'

const logger = loggerService.withContext('useProvider')

/**
 * Fetch all providers from the database.
 */
export function useAllProviders() {
  const query = db.select().from(providersSchema)
  const { data: rawProviders, updatedAt } = useLiveQuery(query)

  const processedProviders = useMemo(() => {
    if (!rawProviders || rawProviders.length === 0) return []
    const transformed = rawProviders.map(provider => transformDbToProvider(provider))
    // Sort by enabled: true first, then false
    return transformed.sort((a, b) => {
      if (a.enabled === b.enabled) return 0
      return a.enabled ? -1 : 1
    })
  }, [rawProviders])

  if (!updatedAt || !rawProviders || rawProviders.length === 0) {
    return {
      providers: [],
      isLoading: true
    }
  }

  return {
    providers: processedProviders,
    isLoading: false
  }
}

/**
 * React Hook for managing a specific provider (Refactored with useSyncExternalStore)
 *
 * Uses ProviderService with optimistic updates for zero-latency UX.
 * Integrates with React 18's useSyncExternalStore for efficient re-renders.
 *
 * @param providerId - The provider ID to watch
 * @returns provider data, loading state, and update method
 *
 * @example
 * ```typescript
 * function ProviderDetail({ providerId }) {
 *   const { provider, isLoading, updateProvider } = useProvider(providerId)
 *
 *   if (isLoading) return <Loading />
 *
 *   return (
 *     <div>
 *       <h1>{provider.name}</h1>
 *       <button onClick={() => updateProvider({ name: 'New Name' })}>Rename</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useProvider(providerId: string) {
  // ==================== Early Return for Invalid ID ====================

  const isValidId = providerId && providerId.trim() !== ''

  // ==================== Subscription (useSyncExternalStore) ====================

  /**
   * Subscribe to specific provider changes
   */
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!isValidId) {
        // Return a no-op unsubscribe for invalid IDs
        return () => {}
      }
      logger.verbose(`Subscribing to provider ${providerId} changes`)
      return providerService.subscribeProvider(providerId, callback)
    },
    [providerId, isValidId]
  )

  /**
   * Get provider snapshot (synchronous from cache)
   */
  const getSnapshot = useCallback(() => {
    if (!isValidId) {
      return null
    }
    return providerService.getProviderCached(providerId)
  }, [providerId, isValidId])

  /**
   * Server snapshot (for SSR compatibility - not used in React Native)
   */
  const getServerSnapshot = useCallback(() => {
    return null
  }, [])

  // Use useSyncExternalStore for reactive updates
  const provider = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // ==================== Loading State ====================

  /**
   * Track if we're loading the provider from database
   */
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Load provider from database if not cached
   */
  useEffect(() => {
    // Skip loading for invalid IDs
    if (!isValidId) {
      setIsLoading(false)
      return
    }

    if (!provider) {
      setIsLoading(true)
      providerService
        .getProvider(providerId)
        .then(() => {
          setIsLoading(false)
        })
        .catch(error => {
          logger.error(`Failed to load provider ${providerId}:`, error as Error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [provider, providerId, isValidId])

  // ==================== Action Methods ====================

  /**
   * Update provider with optimistic updates
   */
  const updateProvider = useCallback(
    async (updates: Partial<Omit<Provider, 'id'>>) => {
      await providerService.updateProvider(providerId, updates)
    },
    [providerId]
  )

  // ==================== Return API ====================

  return {
    provider,
    isLoading: !provider && isLoading,
    updateProvider
  }
}

/**
 * React Hook for the default provider (Optimized with useSyncExternalStore)
 *
 * Uses ProviderService's permanent default provider cache for instant access.
 *
 * @example
 * ```typescript
 * function DefaultProviderStatus() {
 *   const { defaultProvider, isLoading } = useDefaultProvider()
 *
 *   if (isLoading) return <Loading />
 *
 *   return <div>Default Provider: {defaultProvider.name}</div>
 * }
 * ```
 */
export function useDefaultProvider() {
  // ==================== Subscription (useSyncExternalStore) ====================

  const subscribe = useCallback((callback: () => void) => {
    logger.verbose('Subscribing to default provider changes')
    return providerService.subscribeDefaultProvider(callback)
  }, [])

  const getSnapshot = useCallback(() => {
    try {
      return providerService.getDefaultProvider()
    } catch {
      // Default provider not initialized yet
      return null
    }
  }, [])

  const getServerSnapshot = useCallback(() => {
    return null
  }, [])

  const defaultProvider = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // ==================== Loading State ====================

  const [isLoading, setIsLoading] = useState(false)

  /**
   * Initialize default provider if needed
   */
  useEffect(() => {
    if (!defaultProvider) {
      setIsLoading(true)
      providerService
        .initialize()
        .then(() => {
          setIsLoading(false)
        })
        .catch(error => {
          logger.error('Failed to initialize default provider:', error as Error)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [defaultProvider])

  return {
    defaultProvider,
    isLoading: !defaultProvider && isLoading
  }
}
