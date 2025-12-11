import { Project } from './Project';

/**
 * Root object representing a Documentation Set (the opendocs.json file)
 *
 * DocSet is the entry point for OpenDocs documentation. It contains metadata
 * about the documentation and references to all projects.
 */
export interface DocSet {
  /**
   * Documentation set identifier
   */
  id: string;

  /**
   * Human-readable documentation name
   */
  name: string;

  /**
   * Optional description of the documentation set
   */
  description?: string;

  /**
   * OpenDocs specification version
   */
  version: string;

  /**
   * Format of the documentation (currently only "json" is supported)
   * Future formats may include "jsonl" for streaming
   */
  format?: 'json';

  /**
   * Array of projects in this documentation set
   */
  projects: Project[];

  /**
   * Documentation set metadata
   */
  metadata?: {
    /**
     * When the documentation was created
     */
    created?: string;

    /**
     * When the documentation was last modified
     */
    modified?: string;

    /**
     * Generator tool and version
     */
    generator?: {
      name: string;
      version: string;
    };

    /**
     * Repository information
     */
    repository?: {
      type: string;
      url: string;
      directory?: string;
    };

    /**
     * Additional custom metadata
     */
    [key: string]: unknown;
  };
}

/**
 * Utility functions for working with DocSets
 */
export class DocSetUtils {
  /**
   * Create a new DocSet with default values
   */
  static create(options: {
    id: string;
    name: string;
    description?: string;
    generator?: { name: string; version: string };
  }): DocSet {
    return {
      id: options.id,
      name: options.name,
      description: options.description,
      version: '0.1.0',
      format: 'json',
      projects: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        ...(options.generator && { generator: options.generator }),
      },
    };
  }

  /**
   * Find a project by ID
   */
  static findProjectById(docSet: DocSet, projectId: string): Project | undefined {
    return docSet.projects.find(project => project.id === projectId);
  }

  /**
   * Find a project by name
   */
  static findProjectByName(docSet: DocSet, projectName: string): Project | undefined {
    return docSet.projects.find(project => project.name === projectName);
  }

  /**
   * Get all projects for a specific language
   */
  static getProjectsByLanguage(docSet: DocSet, language: string): Project[] {
    return docSet.projects.filter(project => project.language === language);
  }

  /**
   * Add a project to the DocSet
   */
  static addProject(docSet: DocSet, project: Project): void {
    docSet.projects.push(project);
    if (docSet.metadata) {
      docSet.metadata.modified = new Date().toISOString();
    }
  }

  /**
   * Get total number of projects
   */
  static getProjectCount(docSet: DocSet): number {
    return docSet.projects.length;
  }

  /**
   * Validate DocSet structure
   */
  static validate(docSet: DocSet): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!docSet.id) {
      errors.push('DocSet must have an id');
    }

    if (!docSet.name) {
      errors.push('DocSet must have a name');
    }

    if (!docSet.version) {
      errors.push('DocSet must have a version');
    }

    if (!Array.isArray(docSet.projects)) {
      errors.push('DocSet must have a projects array');
    } else {
      const projectIds = new Set<string>();
      for (const project of docSet.projects) {
        if (!project.id) {
          errors.push('All projects must have an id');
        } else if (projectIds.has(project.id)) {
          errors.push(`Duplicate project id: ${project.id}`);
        } else {
          projectIds.add(project.id);
        }

        if (!project.name) {
          errors.push(`Project ${project.id} must have a name`);
        }

        if (!project.language) {
          errors.push(`Project ${project.id} must have a language`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
