import { DocSet, DocItem, RelationUtils } from '@opendocs/model';
import { OpenDocsResolutionCache } from './OpenDocsResolutionCache';

/**
 * Resolves @inheritDoc references and inheritance relationships
 *
 * Provides similar functionality to ApiModel.resolveDeclarationReference
 * from api-extractor, but for OpenDocs DocItems.
 *
 * Features:
 * - Resolves references by FQN, relative name, or parent reference
 * - Traverses inheritance hierarchies (extends/implements)
 * - Caches resolution results for performance
 */
export class InheritanceResolver {
  private readonly _docSet: DocSet;
  private readonly _itemIndex: Map<string, DocItem>;
  private readonly _cache: OpenDocsResolutionCache;

  constructor(docSet: DocSet, cache?: OpenDocsResolutionCache) {
    this._docSet = docSet;
    this._cache = cache || new OpenDocsResolutionCache();
    this._itemIndex = this._buildItemIndex();
  }

  /**
   * Build an index of all DocItems by their ID for fast lookup
   */
  private _buildItemIndex(): Map<string, DocItem> {
    const index = new Map<string, DocItem>();

    for (const project of this._docSet.projects) {
      this._indexItems(project.items || [], index);
    }

    return index;
  }

  /**
   * Recursively index all DocItems including nested children
   */
  private _indexItems(items: DocItem[], index: Map<string, DocItem>): void {
    for (const item of items) {
      index.set(item.id, item);
      if (item.children && item.children.length > 0) {
        this._indexItems(item.children, index);
      }
    }
  }

  /**
   * Resolve a reference string to a DocItem
   *
   * Supports multiple reference formats:
   * - Full FQN: "package#Class#method"
   * - Relative: "Class.method" (resolved from context)
   * - Parent: ".." (resolves to parent of context item)
   * - Sibling: "../SiblingClass"
   *
   * @param reference - The reference string to resolve
   * @param contextItem - The item from which the reference is being made
   * @returns The resolved DocItem, or undefined if not found
   */
  resolveReference(reference: string, contextItem: DocItem): DocItem | undefined {
    // Check cache first
    const cached = this._cache.get(reference, contextItem.id);
    if (cached !== undefined) {
      return cached;
    }

    // Try resolution strategies in order
    let resolved: DocItem | undefined;

    // Strategy 1: Direct FQN lookup
    resolved = this._itemIndex.get(reference);
    if (resolved) {
      this._cache.set(reference, contextItem.id, resolved);
      return resolved;
    }

    // Strategy 2: Parent reference ("..")
    if (reference.startsWith('..')) {
      resolved = this._resolveParent(reference, contextItem);
      if (resolved) {
        this._cache.set(reference, contextItem.id, resolved);
        return resolved;
      }
    }

    // Strategy 3: Relative resolution
    resolved = this._resolveRelative(reference, contextItem);
    this._cache.set(reference, contextItem.id, resolved);
    return resolved;
  }

  /**
   * Resolve a parent reference like ".." or "../SiblingClass"
   */
  private _resolveParent(reference: string, contextItem: DocItem): DocItem | undefined {
    const parentId = contextItem.parentId;
    if (!parentId) return undefined;

    const parent = this._itemIndex.get(parentId);
    if (!parent) return undefined;

    // If reference is just "..", return the parent
    if (reference === '..') {
      return parent;
    }

    // If reference is "../Something", resolve relative to parent
    const remaining = reference.substring(3); // Remove "../"
    return this._resolveRelative(remaining, parent);
  }

  /**
   * Resolve a relative reference by trying to construct FQNs
   *
   * Examples:
   * - "Class.method" from context "package#Namespace#OtherClass"
   *   → Try: "package#Namespace#Class#method", "package#Class#method"
   */
  private _resolveRelative(reference: string, contextItem: DocItem): DocItem | undefined {
    // Build possible FQNs by combining context hierarchy with reference
    const contextParts = contextItem.id.split('#');

    // Try each level of the context hierarchy, from most specific to least
    for (let i = contextParts.length; i > 0; i--) {
      const baseFqn = contextParts.slice(0, i).join('#');

      // Try with # separator (TypeScript style)
      const candidateFqn = `${baseFqn}#${reference}`;
      const item = this._itemIndex.get(candidateFqn);
      if (item) return item;

      // Try with . separator in case reference uses dots
      const dotReference = reference.replace(/\./g, '#');
      if (dotReference !== reference) {
        const dotFqn = `${baseFqn}#${dotReference}`;
        const dotItem = this._itemIndex.get(dotFqn);
        if (dotItem) return dotItem;
      }
    }

    return undefined;
  }

  /**
   * Get all inherited members for a class or interface
   *
   * Traverses the inheritance hierarchy (extends/implements) and collects
   * all members from parent types.
   *
   * @param item - The class or interface to get inherited members for
   * @returns Array of inherited DocItems
   */
  getInheritedMembers(item: DocItem): DocItem[] {
    const inherited: DocItem[] = [];
    const visited = new Set<string>(); // Prevent infinite loops

    this._collectInheritedMembers(item, inherited, visited);

    return inherited;
  }

  /**
   * Recursively collect inherited members
   */
  private _collectInheritedMembers(
    item: DocItem,
    inherited: DocItem[],
    visited: Set<string>
  ): void {
    if (visited.has(item.id)) return;
    visited.add(item.id);

    if (!item.relations) return;

    // Get extends targets
    const extendsTargets = RelationUtils.getTargets(item.relations, 'extends');
    for (const targetId of extendsTargets) {
      const parent = this._itemIndex.get(targetId);
      if (parent) {
        // Add parent's members
        if (parent.children) {
          inherited.push(...parent.children);
        }

        // Recursively get parent's inherited members
        this._collectInheritedMembers(parent, inherited, visited);
      }
    }

    // Get implements targets (for classes implementing interfaces)
    const implementsTargets = RelationUtils.getTargets(item.relations, 'implements');
    for (const targetId of implementsTargets) {
      const interface_ = this._itemIndex.get(targetId);
      if (interface_) {
        // Add interface members
        if (interface_.children) {
          inherited.push(...interface_.children);
        }

        // Interfaces can extend other interfaces
        this._collectInheritedMembers(interface_, inherited, visited);
      }
    }
  }

  /**
   * Get cache statistics (useful for debugging/monitoring)
   */
  getCacheStats() {
    return this._cache.getStats();
  }

  /**
   * Clear the resolution cache
   */
  clearCache(): void {
    this._cache.clear();
  }
}
