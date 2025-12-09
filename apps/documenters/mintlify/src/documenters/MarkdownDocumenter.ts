import * as path from 'path';
import { PackageName, FileSystem, NewlineKind } from '@rushstack/node-core-library';
import * as clack from '@clack/prompts';

import { SecurityUtils } from '../utils/SecurityUtils';
import { DocumentationError, ErrorCode, FileSystemError, ValidationError } from '../errors/DocumentationError';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { createDebugger, type Debugger } from '../utils/debug';
import { NavigationManager, NavigationItem } from '../navigation/NavigationManager';
import { CacheManager, getGlobalCacheManager } from '../cache/CacheManager';
import { DocSet, DocItem, Project } from '@opendocs/model';

import { CustomDocNodes } from '../nodes/CustomDocNodeKind';
import { Utilities } from '../utils/Utilities';
import { LiquidTemplateManager } from '../templates';
import { TypeInfoGenerator } from '../utils/TypeInfoGenerator';
import { OpenDocsAdapter } from '../adapters/OpenDocsAdapter';

const debug: Debugger = createDebugger('markdown-documenter');

/**
 * Configuration options for MarkdownDocumenter
 * @public
 */
export interface IMarkdownDocumenterOptions {
  docSet: DocSet;
  outputFolder: string;
  docsJsonPath?: string;
  tabName?: string;
  groupName?: string;
  enableMenu?: boolean;
  convertReadme?: boolean;
  readmeTitle?: string;
  verbose?: boolean;

  /**
   * Template configuration for customizing output
   */
  templates?: {
    /**
     * Directory containing user templates (Liquid files)
     */
    userTemplateDir?: string;

    /**
     * Individual template overrides - map template names to file paths
     * Example: `{ class: './my-templates/custom-class.liquid' \}`
     */
    overrides?: Record<string, string>;

    /**
     * Whether to enable template caching (default: true)
     */
    cache?: boolean;

    /**
     * Whether to use strict mode for templates (default: true)
     */
    strict?: boolean;

    /**
     * Configuration for controlling how API items are rendered
     */
    rendering?: {
      /**
       * Whether to hide the value column in string enum member tables (default: true)
       */
      hideStringEnumValues?: boolean;
    };
  };
}


/**
 * Core class for rendering API documentation in Mintlify-compatible MDX format.
 *
 * This class takes OpenDocs DocSet data and converts it into MDX files with proper
 * Mintlify frontmatter, navigation integration, and formatting suitable for documentation sites.
 * The process involves multiple stages including {@link OpenDocsAdapter | data conversion}
 * and {@link LiquidTemplateManager | template rendering}.
 *
 * @remarks
 * The main workflow involves:
 * 1. Loading the DocSet from `opendocs.json`
 * 2. Converting DocItems to template data using {@link OpenDocsAdapter}
 * 3. Rendering templates via {@link LiquidTemplateManager}
 * 4. Updating the Mintlify navigation structure
 *
 * For detailed architecture information, see the {@link /architecture/generation-layer | Generation Layer}
 * documentation and the {@link /architecture/overview | Architecture Overview}.
 *
 * @see /architecture/generation-layer - Generation workflow details
 * @see /architecture/overview - System architecture overview
 *
 * @public
 */
export class MarkdownDocumenter {
  private readonly _docSet: DocSet;
  private readonly _outputFolder: string;
  private readonly _docsJsonPath?: string;
  private readonly _navigationManager: NavigationManager;
  private readonly _templateManager: LiquidTemplateManager;
  private readonly _adapter: OpenDocsAdapter;
  private _convertReadme: boolean = false;
  private _readmeTitle: string = 'README';
  private readonly _verbose: boolean = false;
  private readonly _renderingConfig: {
    hideStringEnumValues: boolean;
  };

  /**
   * Icon mapping for different DocItem kinds
   */
  private static readonly ITEM_ICONS: Partial<Record<string, string>> = {
    'class': 'box',
    'interface': 'plug',
    'function': 'function',
    'method': 'function',
    'constructor': 'function',
    'property': 'variable',
    'enum': 'list',
    'type-alias': 'file-code',
    'variable': 'variable',
    'namespace': 'folder',
    'package': 'package',
    'module': 'book'
  };

  // Security and resource limits
  private static readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per file
  private static readonly MAX_TOTAL_OUTPUT_SIZE_BYTES = 500 * 1024 * 1024; // 500MB total
  private static readonly MAX_RECURSION_DEPTH = 25; // Prevent stack overflow
  private static readonly MAX_PROCESSING_TIME_MS = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_FILENAME_LENGTH = 200; // Reasonable filename limit

  // Track processing state for resource management
  private _currentRecursionDepth = 0;
  private _startTime = Date.now();
  private _totalOutputSize = 0;

  public constructor(options: IMarkdownDocumenterOptions) {
    this._docSet = options.docSet;
    this._outputFolder = options.outputFolder;
    this._docsJsonPath = options.docsJsonPath;
    this._convertReadme = options.convertReadme || false;
    this._readmeTitle = options.readmeTitle || 'README';
    this._verbose = options.verbose || false;

    // Initialize resource tracking
    this._startTime = Date.now();
    this._totalOutputSize = 0;
    this._currentRecursionDepth = 0;

    // Initialize rendering config with defaults
    this._renderingConfig = {
      hideStringEnumValues: options.templates?.rendering?.hideStringEnumValues ?? true
    };

    // Initialize OpenDocs adapter for converting DocItems to template data
    this._adapter = new OpenDocsAdapter(this._docSet);

    // Initialize template system
    this._templateManager = new LiquidTemplateManager({
      userTemplateDir: options.templates?.userTemplateDir,
      overrides: options.templates?.overrides,
      cache: options.templates?.cache !== false,
      strict: options.templates?.strict !== false
    });

    // Initialize cache manager for performance
    const cacheManager = getGlobalCacheManager({
      enabled: true,
      enableStats: true,
      typeAnalysis: { maxSize: 1000, enabled: true },
      apiResolution: { maxSize: 500, enabled: true }
    });

    // Initialize navigation manager
    this._navigationManager = new NavigationManager({
      docsJsonPath: options.docsJsonPath,
      tabName: options.tabName,
      groupName: options.groupName,
      enableMenu: options.enableMenu,
      outputFolder: this._outputFolder
    });
  }

  public async generateFiles(): Promise<void> {
    const cacheManager = getGlobalCacheManager();

    // Initialize template system
    await this._templateManager.initialize();

    try {
      this._deleteOldOutputFiles();

      // Copy Mintlify components to snippets folder
      this._copyMintlifyComponents();

      // Generate TypeInfo.jsx with type information
      this._generateTypeInfo();

      // Generate ValidRefs.jsx for link validation
      this._generateValidRefs();

      // Generate ValidPages.jsx for page link validation
      this._generateValidPages();

      // Generate TsdocsConfig.jsx for runtime configuration
      this._generateTsdocsConfig();

      // Generate consolidated runtime type declarations
      this._generateRuntimeTypes();

      // Generate documentation pages for all DocItems in all projects
      for (const project of this._docSet.projects) {
        for (const item of project.items || []) {
          await this._writeDocItemPage(item);
        }
      }

      // Convert README.md to index.mdx if requested
      if (this._convertReadme) {
        this._convertReadmeToIndex();
      }

      // Generate navigation after all pages are written
      const navigationConfig = this._navigationManager.getStats();
      if (navigationConfig.totalItems > 0) {
        this.generateNavigation();
      }

      // Print cache statistics
      cacheManager.printStats();
    } finally {
      // Cleanup template resources
      await this._templateManager.cleanup();
    }
  }

  /**
   * Generate documentation page for a DocItem
   */
  private async _writeDocItemPage(docItem: DocItem, parentItem?: DocItem): Promise<void> {
    // Check recursion depth to prevent stack overflow
    if (this._currentRecursionDepth > MarkdownDocumenter.MAX_RECURSION_DEPTH) {
      throw new ValidationError(
        `Maximum recursion depth exceeded (${MarkdownDocumenter.MAX_RECURSION_DEPTH})`,
        { resource: 'docItem', operation: 'writeDocItemPage', data: { displayName: docItem.name } }
      );
    }

    const icon = this._getIconForDocItem(docItem);
    const description = this._getDescriptionForDocItem(docItem) || `${docItem.name} API documentation`;

    // Build breadcrumb
    const breadcrumb = this._buildBreadcrumbForDocItem(docItem);

    // Build navigation info for top-level items
    const navigation = this._buildNavigationInfoForDocItem(docItem);

    // Convert DocItem to template data using OpenDocsAdapter
    const templateData = this._adapter.convertToTemplateData(docItem, {
      pageTitle: this._getPageTitleForDocItem(docItem),
      pageDescription: description,
      pageIcon: icon,
      breadcrumb: breadcrumb,
      navigation: navigation,
      getLinkFilenameForApiItem: (itemId: string) => this._getLinkFilenameForDocItem(itemId)
    });

    // Add rendering config to template data
    templateData.rendering = this._renderingConfig;

    // Render template
    const renderedContent = await this._templateManager.renderDocItem(docItem, templateData);

    // Generate filename
    const safeFilename = this._getFilenameForDocItem(docItem);
    const filename = path.join(this._outputFolder, safeFilename);

    // Validate and write file
    try {
      SecurityUtils.validateFilePath(this._outputFolder, filename);

      // Check total output size limit
      const contentLength = Buffer.byteLength(renderedContent, 'utf8');
      if (this._totalOutputSize + contentLength > MarkdownDocumenter.MAX_TOTAL_OUTPUT_SIZE_BYTES) {
        throw new ValidationError(
          `Total output size would exceed maximum of ${MarkdownDocumenter.MAX_TOTAL_OUTPUT_SIZE_BYTES / (1024 * 1024)}MB`,
          {
            resource: filename, operation: 'validateTotalSize', data: {
              currentSize: this._totalOutputSize,
              newSize: contentLength,
              maxSize: MarkdownDocumenter.MAX_TOTAL_OUTPUT_SIZE_BYTES
            }
          }
        );
      }

      // Check individual file size limit
      if (contentLength > MarkdownDocumenter.MAX_FILE_SIZE_BYTES) {
        throw new ValidationError(
          `Generated content exceeds maximum file size of ${MarkdownDocumenter.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB for ${filename}`,
          { resource: filename, operation: 'validateFileContent', data: { size: contentLength } }
        );
      }

      // Ensure parent directory exists for nested folder structure
      const directory = path.dirname(filename);
      FileSystem.ensureFolder(directory);

      FileSystem.writeFile(filename, renderedContent, {
        convertLineEndings: NewlineKind.CrLf
      });

      // Update total output size tracking
      this._totalOutputSize += contentLength;
    } catch (error) {
      if (error instanceof DocumentationError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to write documentation file: ${filename}`,
        ErrorCode.FILE_WRITE_ERROR,
        {
          resource: filename,
          operation: 'writeFile',
          cause: error instanceof Error ? error : new Error(String(error))
        }
      );
    }

    // Add to navigation (all items, with parent tracking for members)
    const navigationConfig = this._navigationManager.getStats();
    if (navigationConfig.tabName) {
      const parentFilename = parentItem ? this._getFilenameForDocItem(parentItem) : undefined;
      this._addToNavigationForDocItem(docItem, filename, parentFilename);
    }

    // Process child items recursively, passing current item as parent
    // Skip enum members - they are rendered within the parent enum file
    if (docItem.children && docItem.children.length > 0 && docItem.kind !== 'enum') {
      this._currentRecursionDepth++;
      try {
        for (const child of docItem.children) {
          await this._writeDocItemPage(child, docItem);
        }
      } finally {
        this._currentRecursionDepth--;
      }
    }
  }

  // ====================================================================
  // DocItem Helper Methods (for OpenDocs migration)
  // ====================================================================

  /**
   * Get icon for DocItem based on kind
   */
  private _getIconForDocItem(docItem: DocItem): string {
    return MarkdownDocumenter.ITEM_ICONS[docItem.kind] || 'file';
  }

  /**
   * Get description from DocItem's docBlock
   */
  private _getDescriptionForDocItem(docItem: DocItem): string | undefined {
    return docItem.docBlock?.content;
  }

  /**
   * Build breadcrumb for DocItem
   */
  private _buildBreadcrumbForDocItem(docItem: DocItem): Array<{ name: string; path?: string }> {
    const breadcrumb: Array<{ name: string; path?: string }> = [];
    let current: DocItem | undefined = docItem;

    // Build breadcrumb by traversing parent chain
    while (current) {
      const link = this._getLinkFilenameForDocItem(current.id);
      breadcrumb.unshift({
        name: current.name,
        path: link
      });
      // Find parent by parentId
      current = current.parentId ? this._findDocItemById(current.parentId) : undefined;
    }

    return breadcrumb;
  }

  /**
   * Build navigation info for DocItem
   */
  private _buildNavigationInfoForDocItem(docItem: DocItem): any {
    // For now, return undefined - navigation is handled separately
    return undefined;
  }

  /**
   * Get page title for DocItem
   */
  private _getPageTitleForDocItem(docItem: DocItem): string {
    return docItem.name;
  }

  /**
   * Get link filename for a DocItem by ID
   */
  private _getLinkFilenameForDocItem(itemId: string): string | undefined {
    const item = this._findDocItemById(itemId);
    if (!item) return undefined;
    return this._getFilenameForDocItem(item);
  }

  /**
   * Get filename for DocItem
   */
  private _getFilenameForDocItem(docItem: DocItem): string {
    // Create filename from item kind and name
    const baseName = Utilities.normalizeDisplayName(docItem.name);
    return `${baseName}.mdx`;
  }

  /**
   * Add DocItem to navigation
   */
  private _addToNavigationForDocItem(docItem: DocItem, filename: string, parentFilename?: string): void {
    const navigationItem: NavigationItem = {
      page: path.relative(this._outputFolder, filename).replace(/\\/g, '/').replace(/\.mdx$/, ''),
      icon: this._getIconForDocItem(docItem),
      displayName: docItem.name,
      parentPage: parentFilename
    };

    this._navigationManager.addNavigationItem(navigationItem);
  }

  /**
   * Find a DocItem by ID within the DocSet
   */
  private _findDocItemById(id: string): DocItem | undefined {
    for (const project of this._docSet.projects) {
      const found = this._findDocItemByIdRecursive(id, project.items || []);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Recursively search for DocItem by ID
   */
  private _findDocItemByIdRecursive(id: string, items: DocItem[]): DocItem | undefined {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this._findDocItemByIdRecursive(id, item.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  // ====================================================================
  // Helper Methods (TODO: Implement for DocSet)
  // ====================================================================

  private _deleteOldOutputFiles(): void {
    // TODO: Implement for DocSet migration
  }

  private _copyMintlifyComponents(): void {
    // TODO: Implement for DocSet migration
  }

  private _generateTypeInfo(): void {
    // TODO: Implement for DocSet migration
  }

  private _generateValidRefs(): void {
    // TODO: Implement for DocSet migration
  }

  private _generateValidPages(): void {
    // TODO: Implement for DocSet migration
  }

  private _generateTsdocsConfig(): void {
    // TODO: Implement for DocSet migration
  }

  private _generateRuntimeTypes(): void {
    // TODO: Implement for DocSet migration
  }

  private _convertReadmeToIndex(): void {
    // TODO: Implement for DocSet migration
  }

  public generateNavigation(): void {
    // TODO: Implement for DocSet migration
  }

}
