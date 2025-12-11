import * as path from 'path';
import * as fs from 'fs';
import { extractDocumentation, ExtractorOptions } from '@opendocs/extractor-typescript';
import { DocSet } from '@opendocs/model';

export interface OpenDocsExtractorServiceOptions {
  /**
   * Path to tsconfig.json
   */
  tsconfigPath: string;

  /**
   * Project name (optional, defaults to package name from tsconfig)
   */
  projectName?: string;

  /**
   * Project ID (optional, defaults to project name)
   */
  projectId?: string;

  /**
   * Output path for opendocs.json
   */
  outputPath: string;

  /**
   * Repository URL (optional)
   */
  repoUrl?: string;

  /**
   * Repository type (optional, defaults to 'git')
   */
  repoType?: string;

  /**
   * Template for generating file URLs in repository
   * Example: "https://github.com/user/repo/blob/main/{path}#L{line}"
   */
  fileUrlTemplate?: string;
}

/**
 * Service for running OpenDocs TypeScript extractor
 *
 * Replaces ApiExtractorService with OpenDocs-based extraction.
 * Provides a consistent interface for invoking the OpenDocs extractor
 * and managing opendocs.json files.
 */
export class OpenDocsExtractorService {
  /**
   * Run OpenDocs extraction and save to file
   *
   * @param options - Extraction options
   * @returns The extracted DocSet
   */
  public static async run(options: OpenDocsExtractorServiceOptions): Promise<DocSet> {
    // Validate tsconfig exists
    if (!fs.existsSync(options.tsconfigPath)) {
      throw new Error(`TypeScript config not found: ${options.tsconfigPath}`);
    }

    // Build extractor options
    const extractorOptions: ExtractorOptions = {
      tsconfigPath: options.tsconfigPath,
      projectName: options.projectName,
      projectId: options.projectId,
      repoUrl: options.repoUrl,
      repoType: options.repoType || 'git',
      fileUrlTemplate: options.fileUrlTemplate,
    };

    // Run extraction
    const docSet = await extractDocumentation(extractorOptions);

    // Ensure output directory exists
    const outputDir = path.dirname(options.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write opendocs.json
    fs.writeFileSync(options.outputPath, JSON.stringify(docSet, null, 2), 'utf8');

    return docSet;
  }

  /**
   * Load existing opendocs.json file
   *
   * @param filePath - Path to opendocs.json
   * @returns The loaded DocSet
   */
  public static load(filePath: string): DocSet {
    if (!fs.existsSync(filePath)) {
      throw new Error(`OpenDocs file not found: ${filePath}`);
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as DocSet;
    } catch (error) {
      throw new Error(
        `Failed to load OpenDocs file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if an opendocs.json file exists at the specified path
   *
   * @param filePath - Path to check
   * @returns true if file exists
   */
  public static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
