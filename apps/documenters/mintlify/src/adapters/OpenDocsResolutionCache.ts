import { DocItem } from '@opendocs/model';

/**
 * LRU cache for DocItem reference resolution
 *
 * Caches the results of reference resolution to improve performance
 * when resolving @inheritDoc and cross-references.
 *
 * Similar to ApiResolutionCache from mint-tsdocs but for OpenDocs DocItems.
 */
export class OpenDocsResolutionCache {
  private readonly _cache: Map<string, DocItem | undefined>;
  private readonly _maxSize: number;
  private _hitCount = 0;
  private _missCount = 0;

  constructor(maxSize: number = 500) {
    this._cache = new Map();
    this._maxSize = maxSize;
  }

  /**
   * Get a cached resolution result
   *
   * @param reference - The reference string being resolved
   * @param contextItemId - The ID of the item from which the reference is being made
   * @returns The resolved DocItem, or undefined if not in cache
   */
  get(reference: string, contextItemId: string): DocItem | undefined {
    const key = this._buildKey(reference, contextItemId);
    const result = this._cache.get(key);

    if (result !== undefined) {
      this._hitCount++;
      // Move to end for LRU (delete and re-add)
      this._cache.delete(key);
      this._cache.set(key, result);
      return result;
    }

    this._missCount++;
    return undefined;
  }

  /**
   * Cache a resolution result
   *
   * @param reference - The reference string being resolved
   * @param contextItemId - The ID of the item from which the reference is being made
   * @param item - The resolved DocItem (or undefined if resolution failed)
   */
  set(reference: string, contextItemId: string, item: DocItem | undefined): void {
    const key = this._buildKey(reference, contextItemId);

    // Evict oldest entry if cache is full and this is a new key
    if (this._cache.size >= this._maxSize && !this._cache.has(key)) {
      const firstKey = this._cache.keys().next().value;
      if (firstKey) {
        this._cache.delete(firstKey);
      }
    }

    this._cache.set(key, item);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this._cache.clear();
    this._hitCount = 0;
    this._missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this._hitCount + this._missCount;
    return {
      size: this._cache.size,
      maxSize: this._maxSize,
      hitRate: total > 0 ? this._hitCount / total : 0,
      hitCount: this._hitCount,
      missCount: this._missCount,
    };
  }

  /**
   * Build a cache key from reference and context
   */
  private _buildKey(reference: string, contextItemId: string): string {
    return `${reference}::${contextItemId}`;
  }
}
