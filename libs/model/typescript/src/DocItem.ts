import { DocBlock } from './DocBlock';
import { Relations } from './Relation';

/**
 * Universal documentation item - the fundamental unit of OpenDocs
 *
 * DocItem represents any documentable code element in a language-agnostic way.
 * Every element (class, function, method, property, etc.) is represented as a DocItem.
 *
 * The `kind` field provides language-specific typing while maintaining the universal model.
 */
/**
 * Source code location
 */
export interface Location {
  /**
   * File path (relative to project root)
   */
  path: string;

  /**
   * Line number (1-indexed)
   */
  number: number;

  /**
   * Column number (1-indexed)
   */
  column?: number;
}

export interface DocItem {
  /**
   * Language-native fully qualified name
   *
   * Uses each language's natural naming convention:
   * - TypeScript: package#Symbol or package#Class#member
   * - Rust: crate::module::Type
   * - Go: package.Function or package.Type
   * - Python: module.Class.method
   * - Java: package.Class.method
   */
  id: string;

  /**
   * Display name of the item
   */
  name: string;

  /**
   * Kind/type of the item - language-specific but standardized where possible
   * Examples: "class", "function", "method", "property", "interface", "enum", etc.
   */
  kind: string;

  /**
   * Source language
   */
  language: string;

  /**
   * Source code location
   */
  location?: Location;

  /**
   * Code relationships (container, extends, implements, etc.)
   */
  relations?: Relations;

  /**
   * Documentation content for this item
   */
  docBlock?: DocBlock;

  /**
   * Child items (methods, properties, nested types, etc.)
   */
  items?: DocItem[];

  /**
   * Language-specific metadata
   *
   * Per the OpenDocs specification, language-specific fields like visibility, signature,
   * isStatic, isReadonly, type, etc. should be placed in this metadata field, not as
   * top-level properties. This maintains a clean universal model while preserving all
   * language-specific information.
   *
   * Example:
   * ```json
   * {
   *   "metadata": {
   *     "visibility": "public",
   *     "isStatic": true,
   *     "signature": {
   *       "parameters": [...],
   *       "returnType": {...}
   *     }
   *   }
   * }
   * ```
   */
  metadata?: Record<string, unknown>;

  /**
   * Optional JSON $ref for external file references
   */
  $ref?: string;
}

/**
 * Parameter information for functions/methods
 */
export interface Parameter {
  /**
   * Parameter name
   */
  name: string;

  /**
   * Parameter type
   */
  type?: TypeReference;

  /**
   * Whether the parameter is optional
   */
  isOptional?: boolean;

  /**
   * Whether the parameter is a rest parameter
   */
  isRest?: boolean;

  /**
   * Default value (as string representation)
   */
  defaultValue?: string;

  /**
   * Parameter description (from @param tag)
   */
  description?: string;
}

/**
 * Type parameter (generic/template parameter)
 */
export interface TypeParameter {
  /**
   * Type parameter name
   */
  name: string;

  /**
   * Constraint type (extends clause)
   */
  constraint?: TypeReference;

  /**
   * Default type
   */
  default?: TypeReference;

  /**
   * Description
   */
  description?: string;
}

/**
 * Type reference - represents a type in a language-agnostic way
 */
export interface TypeReference {
  /**
   * Type name or expression
   */
  name: string;

  /**
   * Optional reference to the type definition (for navigating to the type)
   */
  $ref?: string;

  /**
   * Type arguments (for generic types)
   */
  typeArguments?: TypeReference[];

  /**
   * Whether this is a union type
   */
  isUnion?: boolean;

  /**
   * Whether this is an intersection type
   */
  isIntersection?: boolean;

  /**
   * Whether this is an array type
   */
  isArray?: boolean;

  /**
   * Whether this is a promise/future type
   */
  isPromise?: boolean;

  /**
   * Whether this is a nullable type
   */
  isNullable?: boolean;
}

/**
 * Common item kinds used across languages
 */
export const ItemKind = {
  // Containers
  MODULE: 'module',
  NAMESPACE: 'namespace',
  PACKAGE: 'package',

  // Types
  CLASS: 'class',
  INTERFACE: 'interface',
  ENUM: 'enum',
  STRUCT: 'struct',
  TRAIT: 'trait',
  TYPE_ALIAS: 'typeAlias',

  // Members
  CONSTRUCTOR: 'constructor',
  METHOD: 'method',
  FUNCTION: 'function',
  PROPERTY: 'property',
  FIELD: 'field',
  CONSTANT: 'constant',
  VARIABLE: 'variable',

  // Enum
  ENUM_MEMBER: 'enumMember',

  // Other
  IMPORT: 'import',
  EXPORT: 'export',
} as const;

/**
 * Utility functions for working with DocItems
 */
export class DocItemUtils {
  /**
   * Check if a DocItem is a container (can have child items)
   */
  static isContainer(item: DocItem): boolean {
    return (
      item.kind === ItemKind.MODULE ||
      item.kind === ItemKind.NAMESPACE ||
      item.kind === ItemKind.PACKAGE ||
      item.kind === ItemKind.CLASS ||
      item.kind === ItemKind.INTERFACE ||
      item.kind === ItemKind.ENUM ||
      item.kind === ItemKind.STRUCT
    );
  }

  /**
   * Check if a DocItem has a signature (is callable)
   */
  static hasSignature(item: DocItem): boolean {
    return (
      item.kind === ItemKind.FUNCTION ||
      item.kind === ItemKind.METHOD ||
      item.kind === ItemKind.CONSTRUCTOR
    );
  }

  /**
   * Get the fully qualified name of an item
   * Note: Requires access to the full hierarchy to resolve
   */
  static getFullyQualifiedName(item: DocItem, separator: string = '.'): string {
    // This is a simplified version - full implementation would need to traverse the container hierarchy
    return item.name;
  }

  /**
   * Find a child item by name
   */
  static findChildByName(item: DocItem, name: string): DocItem | undefined {
    return item.items?.find(child => child.name === name);
  }

  /**
   * Find all children of a specific kind
   */
  static findChildrenByKind(item: DocItem, kind: string): DocItem[] {
    return item.items?.filter(child => child.kind === kind) ?? [];
  }

  /**
   * Get all public members of an item
   * Note: Visibility is now in metadata field
   */
  static getPublicMembers(item: DocItem): DocItem[] {
    return (
      item.items?.filter(
        child => (child.metadata as any)?.visibility === 'public' || (child.metadata as any)?.visibility === undefined
      ) ?? []
    );
  }
}
