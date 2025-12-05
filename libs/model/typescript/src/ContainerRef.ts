/**
 * Reference to a parent container (Project or DocItem)
 *
 * ContainerRef allows navigation up the hierarchy from a DocItem to its parent.
 * This enables resolving fully qualified names and understanding context.
 */
export interface ContainerRef {
  /**
   * Reference type: "project" for top-level items, "item" for nested items
   */
  type: 'project' | 'item';

  /**
   * Unique identifier of the container
   * - For type="project": the project ID
   * - For type="item": the parent DocItem ID
   */
  id: string;

  /**
   * Optional JSON $ref to the container's location
   * Enables resolving the actual container when split across files
   */
  $ref?: string;
}

/**
 * Utility functions for working with ContainerRefs
 */
export class ContainerRefUtils {
  /**
   * Create a project container reference
   */
  static createProjectRef(projectId: string, ref?: string): ContainerRef {
    return {
      type: 'project',
      id: projectId,
      ...(ref && { $ref: ref }),
    };
  }

  /**
   * Create an item container reference
   */
  static createItemRef(itemId: string, ref?: string): ContainerRef {
    return {
      type: 'item',
      id: itemId,
      ...(ref && { $ref: ref }),
    };
  }

  /**
   * Check if a container ref points to a project
   */
  static isProjectRef(ref: ContainerRef): boolean {
    return ref.type === 'project';
  }

  /**
   * Check if a container ref points to an item
   */
  static isItemRef(ref: ContainerRef): boolean {
    return ref.type === 'item';
  }
}
