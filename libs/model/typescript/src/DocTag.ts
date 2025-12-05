/**
 * Represents a documentation tag (e.g., @param, @returns, @deprecated)
 *
 * DocTags provide structured metadata about code elements through standardized
 * annotations. They can be simple flags (@deprecated) or complex with parameters
 * and descriptions (@param name description).
 */
export interface DocTag {
  /**
   * Tag name without the @ symbol (e.g., "param", "returns", "deprecated")
   */
  tag: string;

  /**
   * Optional tag content/description
   * For @param: the parameter description
   * For @returns: the return value description
   * For @example: the example code
   */
  content?: string;

  /**
   * Optional parameter name (for @param, @throws, etc.)
   */
  name?: string;

  /**
   * Optional type information (for @param, @returns, etc.)
   */
  type?: string;

  /**
   * Additional tag-specific metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Common documentation tags used across languages
 */
export const CommonTags = {
  // Parameter and return documentation
  PARAM: 'param',
  RETURNS: 'returns',
  THROWS: 'throws',

  // Status and versioning
  DEPRECATED: 'deprecated',
  SINCE: 'since',
  VERSION: 'version',

  // Examples and references
  EXAMPLE: 'example',
  SEE: 'see',
  LINK: 'link',

  // Access and visibility
  PUBLIC: 'public',
  PRIVATE: 'private',
  PROTECTED: 'protected',
  INTERNAL: 'internal',

  // Metadata
  AUTHOR: 'author',
  COPYRIGHT: 'copyright',
  LICENSE: 'license',

  // Type information
  TYPE: 'type',
  TYPEDEF: 'typedef',
  TEMPLATE: 'template',
  GENERIC: 'generic',
} as const;
