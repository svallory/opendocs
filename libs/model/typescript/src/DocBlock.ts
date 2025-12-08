import { DocTag } from './DocTag';

/**
 * Represents structured documentation content extracted from code comments
 *
 * DocBlock provides a standardized way to represent documentation across different
 * languages and documentation formats (JSDoc, JavaDoc, Python docstrings, etc.).
 * Per the OpenDocs specification, it contains a main content field and
 * a tags field for structured metadata.
 */
export interface DocBlock {
  /**
   * Main documentation text. Supports Markdown formatting.
   */
  content?: string;

  /**
   * Documentation tags organized by tag name.
   *
   * Format: Record<string, (string | DocTag)[]>
   * where each tag name maps to an array of values (either simple strings or DocTag objects).
   *
   * Common tags include: param, returns, throws, since, deprecated, example, see, etc.
   *
   * @example
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
    return this.hasTag(docBlock, 'deprecated');
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

  /**
   * Get deprecation information from the deprecated tag
   */
  static getDeprecationInfo(docBlock: DocBlock): (string | DocTag)[] {
    return this.getTags(docBlock, 'deprecated');
  }

  /**
   * Get all example tags
   */
  static getExamples(docBlock: DocBlock): (string | DocTag)[] {
    return this.getTags(docBlock, 'example');
  }

  /**
   * Get all see/seealso tags
   */
  static getSee(docBlock: DocBlock): (string | DocTag)[] {
    const see = this.getTags(docBlock, 'see');
    const seeAlso = this.getTags(docBlock, 'seealso');
    return [...see, ...seeAlso];
  }
}
