/**
 * Universal Type Interface
 *
 * Represents type definitions across all programming languages in a unified format.
 * This interface captures everything needed for comprehensive API documentation
 * while allowing language-specific features through optional properties.
 */

export interface Type {
  kind: 'Type';
  name: string;
  canonicalReference: string;

  /**
   * Complete type definition including all members and structural information.
   * This represents the API surface that developers will interact with.
   */
  definition: {
    /**
     * Constructors that create instances of this type.
     * Languages without explicit constructors may have factory functions instead.
     */
    constructors: Constructor[];

    /**
     * Properties/fields that can be accessed on instances of this type.
     * Includes both instance and static properties where applicable.
     */
    properties: Property[];

    /**
     * Methods that can be called on instances of this type.
     * Includes both instance and static methods where applicable.
     */
    methods: Method[];

    /**
     * Index signatures for bracket notation access (e.g., obj[key]).
     * Supported by most modern languages in some form.
     */
    indexSignatures: IndexSignature[];

    /**
     * Call signatures if this type can be invoked like a function.
     * Applies to function types, callable objects, etc.
     */
    callSignatures: CallSignature[];

    /**
     * Type parameters for generic/polyphormic types.
     * Empty array for non-generic types.
     */
    typeParameters: TypeParameter[];

    /**
     * Inheritance, implementation, and composition relationships.
     * Describes how this type relates to other types in the system.
     */
    heritage?: {
      /**
       * Types this type extends or inherits from.
       * Maps to class inheritance, interface extension, etc.
       */
      extends?: string[];

      /**
       * Interfaces, traits, or contracts this type implements.
       * Maps to interface implementation, trait implementation, etc.
       */
      implements?: string[];

      /**
       * Mixins, traits, or composition relationships.
       * Maps to Go embedding, Rust trait composition, etc.
       */
      mixes?: string[];
    };

    /**
     * Visibility/access control level.
     * Languages without visibility concepts will omit this.
     */
    visibility?: 'public' | 'private' | 'protected' | 'internal' | 'package';

    /**
     * Whether this type cannot be instantiated directly.
     * Maps to abstract classes, pure interfaces, etc.
     */
    isAbstract?: boolean;

    /**
     * Whether this type cannot be extended/inherited from.
     * Maps to sealed classes, final classes, etc.
     */
    isSealed?: boolean;

    /**
     * Whether this type is defined at the type level rather than instance level.
     * Maps to static classes, companion objects, etc.
     */
    isStatic?: boolean;

    /**
     * Whether this type definition is incomplete (partial class, etc.).
     * Primarily used by languages that support partial type definitions.
     */
    isPartial?: boolean;

    /**
     * Whether instances of this type are immutable/readonly.
     * Maps to readonly types, immutable data structures, etc.
     */
    isReadOnly?: boolean;

    /**
     * Whether instances of this type can be modified after creation.
     * Maps to mutable vs immutable types.
     */
    isMutable?: boolean;

    /**
     * Whether this type represents a constant value.
     * Maps to const types, compile-time constants, etc.
     */
    isConst?: boolean;
  };

  /**
   * Metadata that doesn't affect the API surface but provides context.
   * This includes documentation, source location, and deep language-specific features.
   */
  metadata: {
    /**
     * The source language of this type definition.
     */
    language: 'typescript' | 'go' | 'python' | 'csharp' | 'rust' | 'zig' | string;

    /**
     * Documentation content including summary, examples, deprecation notices, etc.
     */
    documentation?: {
      /**
       * Brief description of the type's purpose and usage.
       */
      summary?: string;

      /**
       * Detailed remarks and additional information.
       */
      remarks?: string;

      /**
       * Code examples showing how to use this type.
       */
      examples?: string[];

      /**
       * Deprecation notice and migration guidance.
       */
      deprecated?: string;

      /**
       * References to related types or documentation.
       */
      seeAlso?: string[];

      /**
       * Version information (since when this type exists).
       */
      since?: string;

      /**
       * Author information.
       */
      authors?: string[];

      /**
       * Version tag or semantic version.
       */
      version?: string;
    };

    /**
     * Source code location for cross-referencing and linking.
     */
    sourceLocation?: {
      /**
       * Source file path.
       */
      file: string;

      /**
       * Line number in the source file.
       */
      line: number;

      /**
       * Column number in the source file.
       */
      column: number;

      /**
       * URL to source code in repository (for linking).
       */
      url?: string;
    };

    /**
     * Cross-references to related types and usage information.
     */
    references?: {
      /**
       * Types that this type extends or inherits from.
       */
      inheritsFrom?: string[];

      /**
       * Types that implement this interface/trait/contract.
       */
      implementedBy?: string[];

      /**
       * Types that reference this type in their definitions.
       */
      referencedBy?: string[];

      /**
       * Types that this type references in its definition.
       */
      references?: string[];
    };

    /**
     * Language-specific extensions for deep features that don't affect basic API usage.
     * These are placed in metadata to keep the core definition language-agnostic.
     */
    [language: string]: any;
  };
}

// Supporting type definitions

export interface Constructor {
  /**
   * Constructor name. May be empty for primary constructors.
   */
  name?: string;

  /**
   * Constructor parameters.
   */
  parameters: Parameter[];

  /**
   * Documentation for this constructor.
   */
  documentation?: string;

  /**
   * For algebraic data types: whether this is a variant constructor.
   */
  isVariant?: boolean;

  /**
   * Variant tag for discriminated unions.
   */
  variantTag?: string;

  /**
   * Constructor kind for languages that distinguish them.
   */
  kind?: 'primary' | 'secondary' | 'factory' | 'copy';
}

export interface Property {
  /**
   * Property name.
   */
  name: string;

  /**
   * Property type.
   */
  type: string;

  /**
   * Whether this property is optional (may be undefined/null).
   */
  optional?: boolean;

  /**
   * Whether this property is readonly/immutable.
   */
  readonly?: boolean;

  /**
   * Whether this property can be modified after initialization.
   */
  mutable?: boolean;

  /**
   * Whether this property has a default value.
   */
  hasDefault?: boolean;

  /**
   * Default value if available.
   */
  defaultValue?: string;

  /**
   * Documentation for this property.
   */
  documentation?: string;

  /**
   * Visibility/access level.
   */
  visibility?: 'public' | 'private' | 'protected' | 'internal' | 'package';

  /**
   * Whether this is a static/class property.
   */
  isStatic?: boolean;

  /**
   * Whether this property is abstract (must be implemented).
   */
  isAbstract?: boolean;
}

export interface Method {
  /**
   * Method name.
   */
  name: string;

  /**
   * Method signatures (overloaded methods have multiple signatures).
   */
  signatures: CallSignature[];

  /**
   * Documentation for this method.
   */
  documentation?: string;

  /**
   * Visibility/access level.
   */
  visibility?: 'public' | 'private' | 'protected' | 'internal' | 'package';

  /**
   * Whether this is a static/class method.
   */
  isStatic?: boolean;

  /**
   * Whether this method is abstract (must be implemented).
   */
  isAbstract?: boolean;

  /**
   | Whether this method is virtual (can be overridden).
   */
  isVirtual?: boolean;

  /**
   * Whether this method overrides a parent method.
   */
  isOverride?: boolean;

  /**
   * Whether this method is asynchronous.
   */
  isAsync?: boolean;

  /**
   * Whether this method is a generator function.
   */
  isGenerator?: boolean;
}

export interface IndexSignature {
  /**
   * Type of the index key.
   */
  keyType: string;

  /**
   * Type of the indexed value.
   */
  valueType: string;

  /**
   * Optional name for the index parameter.
   */
  keyName?: string;

  /**
   * Documentation for this index signature.
   */
  documentation?: string;

  /**
   * Whether the indexed value is readonly.
   */
  readonly?: boolean;
}

export interface CallSignature {
  /**
   | Call parameters.
   */
  parameters: Parameter[];

  /**
   * Return type.
   */
  returnType: string;

  /**
   * Documentation for this call signature.
   */
  documentation?: string;

  /**
   * Type parameters for generic calls.
   */
  typeParameters?: TypeParameter[];
}

export interface Parameter {
  /**
   * Parameter name.
   */
  name: string;

  /**
   * Parameter type.
   */
  type: string;

  /**
   * Whether this parameter is optional.
   */
  optional?: boolean;

  /**
   * Whether this is a rest parameter (captures remaining arguments).
   */
  rest?: boolean;

  /**
   * Documentation for this parameter.
   */
  documentation?: string;

  /**
   | Default value if available.
   */
  defaultValue?: string;
}

export interface TypeParameter {
  /**
   * Type parameter name.
   */
  name: string;

  /**
   | Constraint/bound if any.
   */
  constraint?: string;

  /**
   * Default type if any.
   */
  default?: string;

  /**
   * Documentation for this type parameter.
   */
  documentation?: string;

  /**
   * Variance annotation (covariant/contravariant/invariant).
   */
  variance?: 'covariant' | 'contravariant' | 'invariant';
}

export interface Visibility {
  /**
   * Visibility level.
   */
  level: 'public' | 'private' | 'protected' | 'internal' | 'package';

  /**
   * Language-specific visibility details.
   */
  details?: string;
}

export interface Documentation {
  summary?: string;
  remarks?: string;
  examples?: string[];
  deprecated?: string;
  seeAlso?: string[];
  since?: string;
  authors?: string[];
  version?: string;
}

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
  url?: string;
}

export interface HeritageClauses {
  extends?: string[];
  implements?: string[];
  mixes?: string[];
}