/**
 * Represents a documentation tag (e.g., @param, @returns, @deprecated)
 *
 * Per the OpenDocs specification, DocTags have a standardized structure:
 * - `name`: The tag name without @ symbol (e.g., "param", "returns")
 * - `content`: The tag content/description
 * - `parameters`: Optional object with tag-specific parameters (name, type, etc.)
 *
 * Example:
 * ```json
 * {
 *   "name": "param",
 *   "content": "The width of the rectangle",
 *   "parameters": {
 *     "name": "width",
 *     "type": "number"
 *   }
 * }
 * ```
 */
export interface DocTag {
  /**
   * Tag name without the @ symbol (e.g., "param", "returns", "deprecated")
   */
  name: string;

  /**
   * Tag content/description
   * For @param: the parameter description
   * For @returns: the return value description
   * For @example: the example code
   */
  content: string;

  /**
   * Optional tag parameters (name, type, etc.)
   * For @param: { name: "paramName", type: "ParamType" }
   * For @throws: { name: "ExceptionType" }
   */
  parameters?: Record<string, string>;
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
