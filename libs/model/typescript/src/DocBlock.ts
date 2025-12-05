import { DocTag } from './DocTag';

/**
 * Represents structured documentation content extracted from code comments
 *
 * DocBlock provides a standardized way to represent documentation across different
 * languages and documentation formats (JSDoc, JavaDoc, Python docstrings, etc.).
 */
export interface DocBlock {
  /**
   * Main description/summary of the documented element
   */
  description?: string;

  /**
   * Extended remarks or detailed description
   */
  remarks?: string;

  /**
   * Documentation tags organized by tag name
   *
   * Per the OpenDocs specification, tags use the format Record<string, (string | DocTag)[]>
   * where each tag name maps to an array of values (either simple strings or DocTag objects).
   *
   * Example:
   * ```json
   * {
   *   "tags": {
   *     "param": [
   *       { "name": "param", "content": "First number", "parameters": { "name": "a" } }
   *     ],
   *     "returns": ["The sum of the numbers"]
   *   }
   * }
   * ```
   */
  tags?: Record<string, (string | DocTag)[]>;

  /**
   * Code examples demonstrating usage
   */
  examples?: string[];

  /**
   * @deprecated marker and message
   */
  deprecated?: {
    /**
     * Deprecation message
     */
    message?: string;

    /**
     * Version when deprecated
     */
    since?: string;

    /**
     * Suggested alternative
     */
    alternative?: string;
  };

  /**
   * Links to related documentation or external resources
   */
  see?: string[];

  /**
   * Additional metadata specific to the documentation format
   */
  metadata?: Record<string, unknown>;
}

/**
 * Utility functions for working with DocBlocks
 */
export class DocBlockUtils {
  /**
   * Get tags by name from a DocBlock
   */
  static getTags(docBlock: DocBlock, tagName: string): (string | DocTag)[] {
    return docBlock.tags?.[tagName] ?? [];
  }

  /**
   * Check if a DocBlock has a specific tag
   */
  static hasTag(docBlock: DocBlock, tagName: string): boolean {
    return docBlock.tags?.[tagName] !== undefined;
  }

  /**
   * Check if an element is deprecated
   */
  static isDeprecated(docBlock: DocBlock): boolean {
    return docBlock.deprecated !== undefined || this.hasTag(docBlock, 'deprecated');
  }

  /**
   * Get all parameter tags
   */
  static getParamTags(docBlock: DocBlock): (string | DocTag)[] {
    return this.getTags(docBlock, 'param');
  }

  /**
   * Get the returns tag values
   */
  static getReturnsTags(docBlock: DocBlock): (string | DocTag)[] {
    return this.getTags(docBlock, 'returns');
  }
}
