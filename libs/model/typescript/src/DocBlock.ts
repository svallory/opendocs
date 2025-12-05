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
   * Array of documentation tags (@param, @returns, @deprecated, etc.)
   */
  tags?: DocTag[];

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
   * Find a tag by name in a DocBlock
   */
  static findTag(docBlock: DocBlock, tagName: string): DocTag | undefined {
    return docBlock.tags?.find(tag => tag.tag === tagName);
  }

  /**
   * Find all tags with a specific name
   */
  static findTags(docBlock: DocBlock, tagName: string): DocTag[] {
    return docBlock.tags?.filter(tag => tag.tag === tagName) ?? [];
  }

  /**
   * Check if a DocBlock has a specific tag
   */
  static hasTag(docBlock: DocBlock, tagName: string): boolean {
    return docBlock.tags?.some(tag => tag.tag === tagName) ?? false;
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
  static getParamTags(docBlock: DocBlock): DocTag[] {
    return this.findTags(docBlock, 'param');
  }

  /**
   * Get the returns tag
   */
  static getReturnsTag(docBlock: DocBlock): DocTag | undefined {
    return this.findTag(docBlock, 'returns');
  }
}
