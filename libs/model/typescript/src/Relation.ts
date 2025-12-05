/**
 * Typed relationship between DocItems
 *
 * Relation represents connections between code elements like inheritance,
 * implementation, containment, and language-specific relationships.
 */
export interface Relation<K extends string = string> {
  /**
   * Relationship kind (e.g., "container", "extends", "implements", "rust-trait-impl")
   */
  kind: K;

  /**
   * Target DocItem ID (language-native fully qualified name)
   */
  target: string;

  /**
   * Relationship-specific metadata
   *
   * Examples:
   * - { derived: true } for Rust #[derive] traits
   * - { explicit: false } for implicit implementations
   */
  metadata?: Record<string, unknown>;
}

/**
 * Map of relationship kinds to their targets
 *
 * Supports three formats:
 * - string: Simple reference to a DocItem ID
 * - Relation: Complex relationship with metadata
 * - Relation[]: Multiple relationships of the same kind
 */
export type Relations = Record<string, string | Relation | Relation[]>;

/**
 * Common relationship kinds used across languages
 */
export const RelationKind = {
  // Universal relationships
  CONTAINER: 'container',
  EXTENDS: 'extends',
  IMPLEMENTS: 'implements',

  // TypeScript/JavaScript
  TS_EXTENDS: 'ts-extends',
  TS_IMPLEMENTS: 'ts-implements',

  // Rust
  RUST_TRAIT_IMPL: 'rust-trait-impl',
  RUST_SUPERTRAIT: 'rust-supertrait',

  // Go
  GO_RECEIVER: 'go-receiver',
  GO_EMBED: 'go-embed',

  // Python
  PYTHON_DECORATOR: 'python-decorator',
  PYTHON_METACLASS: 'python-metaclass',

  // Java/C#
  JAVA_ANNOTATION: 'java-annotation',
  JAVA_GENERIC_BOUND: 'java-generic-bound',
} as const;

/**
 * Utility functions for working with Relations
 */
export class RelationUtils {
  /**
   * Create a simple string relationship
   */
  static createSimple(kind: string, targetId: string): Record<string, string> {
    return { [kind]: targetId };
  }

  /**
   * Create a complex relationship with metadata
   */
  static createComplex<K extends string>(
    kind: K,
    targetId: string,
    metadata?: Record<string, unknown>
  ): Record<K, Relation<K>> {
    return {
      [kind]: {
        kind,
        target: targetId,
        ...(metadata && { metadata }),
      },
    } as Record<K, Relation<K>>;
  }

  /**
   * Create multiple relationships of the same kind
   */
  static createMultiple<K extends string>(
    kind: K,
    targetIds: string[]
  ): Record<K, string[]> {
    return { [kind]: targetIds } as Record<K, string[]>;
  }

  /**
   * Get relation target(s) from a Relations object
   */
  static getTargets(relations: Relations | undefined, kind: string): string[] {
    if (!relations || !(kind in relations)) {
      return [];
    }

    const value = relations[kind];

    if (typeof value === 'string') {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.map(r => (typeof r === 'string' ? r : r.target));
    }

    return [value.target];
  }

  /**
   * Check if a relationship exists
   */
  static hasRelation(relations: Relations | undefined, kind: string): boolean {
    return relations !== undefined && kind in relations;
  }

  /**
   * Get all relationship kinds in a Relations object
   */
  static getRelationKinds(relations: Relations | undefined): string[] {
    return relations ? Object.keys(relations) : [];
  }
}
