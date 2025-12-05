import { DocItem } from './DocItem';

/**
 * Source repository information
 *
 * Links documentation to source code with customizable URL templates
 */
export interface Repository {
  /**
   * Repository type (git, svn, mercurial, etc.)
   */
  type: string;

  /**
   * Repository URL
   */
  url: string;

  /**
   * Template for generating file URLs
   *
   * Supported placeholders:
   * - {repo} - Repository URL
   * - {hash} - Commit hash
   * - {path} - File path
   * - {line} - Line number
   *
   * Example: "{repo}/blob/{hash}/{path}#L{line}"
   */
  fileUrlTemplate?: string;
}

/**
 * Represents an individual project within a Documentation Set
 *
 * In monorepos, each package, library, or app is a separate Project.
 * Each Project has its own language, version, and contains all DocItems
 * that make up that project's API reference.
 */
export interface Project {
  /**
   * Unique project identifier (e.g., package name, crate name)
   */
  id: string;

  /**
   * Human-readable project name
   */
  name: string;

  /**
   * Optional project description
   */
  description?: string;

  /**
   * Programming language
   */
  language: string;

  /**
   * Project version
   */
  version?: string;

  /**
   * Source repository information for linking to source code
   */
  repository?: Repository;

  /**
   * Top-level documentation items (modules, namespaces, packages)
   */
  items?: DocItem[];

  /**
   * Source root directory (relative to repository root)
   */
  sourceRoot?: string;

  /**
   * Project metadata
   */
  metadata?: {
    /**
     * Repository URL
     */
    repository?: string;

    /**
     * Homepage URL
     */
    homepage?: string;

    /**
     * License
     */
    license?: string;

    /**
     * Authors
     */
    authors?: string[];

    /**
     * Keywords/tags
     */
    keywords?: string[];

    /**
     * Dependencies (for package managers)
     */
    dependencies?: Record<string, string>;

    /**
     * Additional custom metadata
     */
    [key: string]: unknown;
  };

  /**
   * Optional JSON $ref for external file reference
   */
  $ref?: string;
}

/**
 * Supported programming languages
 */
export const SupportedLanguages = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  GO: 'go',
  RUST: 'rust',
  JAVA: 'java',
  CSHARP: 'csharp',
  CPP: 'cpp',
  C: 'c',
  RUBY: 'ruby',
  PHP: 'php',
  SWIFT: 'swift',
  KOTLIN: 'kotlin',
} as const;

/**
 * Utility functions for working with Projects
 */
export class ProjectUtils {
  /**
   * Find an item by ID in a project
   */
  static findItemById(project: Project, itemId: string): DocItem | undefined {
    const searchInItems = (items: DocItem[] | undefined): DocItem | undefined => {
      if (!items) return undefined;

      for (const item of items) {
        if (item.id === itemId) return item;

        const found = searchInItems(item.items);
        if (found) return found;
      }

      return undefined;
    };

    return searchInItems(project.items);
  }

  /**
   * Find all items of a specific kind in a project
   */
  static findItemsByKind(project: Project, kind: string): DocItem[] {
    const results: DocItem[] = [];

    const searchInItems = (items: DocItem[] | undefined): void => {
      if (!items) return;

      for (const item of items) {
        if (item.kind === kind) {
          results.push(item);
        }
        searchInItems(item.items);
      }
    };

    searchInItems(project.items);
    return results;
  }

  /**
   * Get all top-level modules/namespaces
   */
  static getTopLevelModules(project: Project): DocItem[] {
    return (
      project.items?.filter(
        item => item.kind === 'module' || item.kind === 'namespace' || item.kind === 'package'
      ) ?? []
    );
  }

  /**
   * Count total items in a project (recursive)
   */
  static countItems(project: Project): number {
    const countInItems = (items: DocItem[] | undefined): number => {
      if (!items) return 0;

      let count = items.length;
      for (const item of items) {
        count += countInItems(item.items);
      }
      return count;
    };

    return countInItems(project.items);
  }
}
