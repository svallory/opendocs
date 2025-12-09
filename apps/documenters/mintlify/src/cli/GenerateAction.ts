import * as path from 'path';
import { FileSystem } from '@rushstack/node-core-library';
import { DocSet } from '@opendocs/model';
import * as clack from '@clack/prompts';
import chalk from 'chalk';

import type { DocumenterCli } from './ApiDocumenterCommandLine';
import { CommandLineAction } from '@rushstack/ts-command-line';
import { MarkdownDocumenter } from '../documenters/MarkdownDocumenter';
import { BaseAction } from './BaseAction';
import { type CommandLineFlagParameter, type CommandLineStringParameter } from '@rushstack/ts-command-line';
import { DocumentationError, ErrorCode } from '../errors/DocumentationError';
import { loadConfig, findConfigPath } from '../config';
import { SecurityUtils } from '../utils/SecurityUtils';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { TsConfigValidator } from '../utils/TsConfigValidator';
import { showCliHeader } from './CliHelpers';
import * as GenerateHelp from './help/GenerateHelp';
import { IssueDisplayUtils, type IssueMessage, type IssueGroup } from './IssueDisplayUtils';
import { OpenDocsExtractorService } from './services/OpenDocsExtractorService';
import { TypeScriptCompiler } from './services/TypeScriptCompiler';
import { TsConfigHelper } from './helpers/TsConfigHelper';
import { S_BAR } from './utils/constants';

/**
 * CLI action for generating Mintlify-compatible MDX documentation.
 *
 * This action:
 * 1. Loads unified config from opendocs-mintlify.config.json (or package.json)
 * 2. Validates and compiles TypeScript
 * 3. Runs OpenDocs extractor to generate opendocs.json
 * 4. Converts DocSet to MDX documentation with Mintlify integration
 *
 * @see /cli-reference - CLI command documentation
 * @see /architecture/generation-layer - Generation workflow architecture
 *
 * @public
 */
export class GenerateAction extends BaseAction {
  /** Command-line flag to skip OpenDocs extractor execution */
  private readonly _skipExtractorParameter: CommandLineFlagParameter;

  /** Command-line flag to enable linting warnings */
  private readonly _lintParameter: CommandLineFlagParameter;

  /** Command-line flag to show verbose output */
  private readonly _verboseParameter: CommandLineFlagParameter;

  /** Project directory parameter (flag) */
  private readonly _projectDirParameter: CommandLineStringParameter;

  /** Reference to parent parser for running init if needed */
  public readonly parser: DocumenterCli;

  /**
   * Initializes the generate action with command-line parameters.
   *
   * @param parser - The parent CLI parser instance
   */
  public constructor(parser: DocumenterCli) {
    super({
      actionName: 'generate',
      summary: 'Generate Mintlify-compatible MDX documentation from TypeScript source',
      documentation:
        'Loads configuration from opendocs-mintlify.config.json (or package.json), ' +
        'runs OpenDocs extractor to generate opendocs.json, then generates MDX documentation ' +
        'with Mintlify frontmatter and navigation integration.\n\n' +
        'Usage:\n' +
        '  opendocs-mintlify generate [PROJECT_DIR]\n' +
        '  opendocs-mintlify [PROJECT_DIR]  (shorthand)\n\n' +
        'Examples:\n' +
        '  opendocs-mintlify generate\n' +
        '  opendocs-mintlify generate ./packages/my-lib\n' +
        '  opendocs-mintlify ./packages/my-lib'
    });

    this.parser = parser;

    this._projectDirParameter = this.defineStringParameter({
      parameterLongName: '--project-dir',
      argumentName: 'PATH',
      description: 'Project directory containing opendocs-mintlify.config.json (default: current directory)'
    });

    this._skipExtractorParameter = this.defineFlagParameter({
      parameterLongName: '--skip-extractor',
      description: 'Skip running OpenDocs extractor (use existing opendocs.json in .tsdocs/)'
    });

    this._lintParameter = this.defineFlagParameter({
      parameterLongName: '--lint',
      description: 'Show TypeScript compilation warnings and suggestions'
    });

    this._verboseParameter = this.defineFlagParameter({
      parameterLongName: '--verbose',
      parameterShortName: '-v',
      description: 'Show detailed output including component installation progress'
    });

    // Define remainder to accept positional project directory argument
    this.defineCommandLineRemainder({
      description: 'Optional project directory path'
    });
  }

  /**
   * Executes the documentation generation process.
   *
   * This method:
   * 1. Loads unified config via cosmiconfig
   * 2. Invalidates cache if config is newer than .tsdocs/
   * 3. Creates .tsdocs/ directory if needed
   * 4. Validates and compiles TypeScript
   * 5. Runs OpenDocs extractor (unless --skip-extractor)
   * 6. Loads DocSet from opendocs.json
   * 7. Generates MDX documentation
   *
   * @protected
   * @override
   */
  protected override async onExecuteAsync(): Promise<void> {
    // Check if --help was requested (check process.argv since ts-command-line intercepts it)
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      GenerateHelp.showHelp();
      return;
    }

    // Determine project directory from either positional arg (remainder) or flag
    let projectDir: string;

    if (this.remainder && this.remainder.values.length > 0 && !this.remainder.values[0].startsWith('-')) {
      // Use first positional argument as project directory (if not a flag)
      const rawPath = this.remainder.values[0];
      SecurityUtils.validateCliInput(rawPath, 'Project directory');
      projectDir = path.resolve(process.cwd(), rawPath);
    } else if (this._projectDirParameter.value) {
      // Use --project-dir flag
      const rawPath = this._projectDirParameter.value;
      SecurityUtils.validateCliInput(rawPath, 'Project directory');
      projectDir = path.resolve(process.cwd(), rawPath);
    } else {
      // Default to current directory
      projectDir = process.cwd();
    }

    showCliHeader();

    // Change to project directory
    const originalCwd = process.cwd();
    if (projectDir !== originalCwd) {
      clack.log.info(`Using project directory: ${projectDir}`);
      process.chdir(projectDir);
    }

    try {
      // Step 1: Load configuration
      let config;
      try {
        config = loadConfig(projectDir);
      } catch (error) {
        // If config not found, prompt to run init
        if (error instanceof DocumentationError && error.code === ErrorCode.CONFIG_NOT_FOUND) {
          clack.log.error('No mint-tsdocs configuration found.');

          const shouldInit = await clack.confirm({
            message: 'Would you like to initialize mint-tsdocs now?',
            initialValue: true
          });

          if (clack.isCancel(shouldInit) || !shouldInit) {
            throw new DocumentationError(
              'Cannot generate documentation without configuration. Run "mint-tsdocs init" to create a configuration file.',
              ErrorCode.CONFIG_NOT_FOUND
            );
          }

          // Run init action
          const initSpinner = clack.spinner();
          initSpinner.start('Initializing mint-tsdocs');
          try {
            const { InitAction } = await import('./InitAction.js');
            const initAction = new InitAction(this.parser as any);
            await initAction.onExecuteAsync();
            initSpinner.stop('Initialization complete');
          } catch (initError) {
            initSpinner.stop('Initialization failed');
            throw initError;
          }

          // Load config after init
          config = loadConfig(projectDir);
        } else {
          throw error;
        }
      }

      // Determine .tsdocs directory location
      const tsdocsDir = config.docsJson
        ? path.join(path.dirname(config.docsJson), '.tsdocs')
        : path.join(projectDir, 'docs', '.tsdocs');

      // Step 2: Check if config file is newer than cache - invalidate if so
      const configPath = findConfigPath(projectDir);
      if (configPath && FileSystem.exists(tsdocsDir)) {
        const configStats = FileSystem.getStatistics(configPath);
        const cacheStats = FileSystem.getStatistics(tsdocsDir);

        if (configStats.mtime > cacheStats.mtime) {
          if (this._verboseParameter.value) {
            clack.log.info('Configuration updated - invalidating cache...');
          }
          FileSystem.deleteFolder(tsdocsDir);
          if (this._verboseParameter.value) {
            clack.log.success('Cache invalidated');
          }
        }
      }

      // Step 3: Ensure .tsdocs directory exists
      FileSystem.ensureFolder(tsdocsDir);

      // Step 4: Validate and compile TypeScript
      // Determine tsconfig path from config or auto-detect
      const tsconfigPath = config.tsconfigPath || this._findTsConfig(projectDir);
      await this._validateAndCompileTypeScript(projectDir, tsconfigPath);

      // Step 5: Determine opendocs.json path
      const openDocsPath = path.join(tsdocsDir, 'opendocs.json');

      // Step 6: Run OpenDocs extractor if not skipped
      if (!this._skipExtractorParameter.value) {
        await this._runOpenDocsExtractor(tsconfigPath, openDocsPath, config);
      } else {
        clack.log.warn('Skipping OpenDocs extractor (--skip-extractor flag set)');
      }

      // Step 7: Load DocSet from opendocs.json
      const docSet = OpenDocsExtractorService.load(openDocsPath);

      // Step 8: Generate documentation
      const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter({
        docSet,
        outputFolder: config.outputFolder,
        docsJsonPath: config.docsJson,
        tabName: config.tabName,
        groupName: config.groupName,
        enableMenu: false,
        convertReadme: config.convertReadme,
        readmeTitle: config.readmeTitle,
        templates: config.templates,
        verbose: this._verboseParameter.value
      });

      // const generateSpinner = clack.spinner();

      try {
        await markdownDocumenter.generateFiles();
        clack.log.success(`Generation completed`);
      } catch (generateError) {
        clack.log.error('Generation failed');
        throw generateError;
      }

      // Calculate Mintlify project root (where mint.json is)
      const mintProjectRoot = config.docsJson
        ? path.dirname(config.docsJson)
        : path.join(projectDir, 'docs');

      // Make path relative to CWD for better readability
      const relativeMintRoot = path.relative(process.cwd(), mintProjectRoot);
      const cdCommand = relativeMintRoot ? `cd ${relativeMintRoot} && ` : '';

      clack.outro(`Run ${chalk.cyan(`${cdCommand}mint dev`)} to view the documentation`);
    } finally {
      // Restore original working directory
      if (projectDir !== originalCwd) {
        process.chdir(originalCwd);
      }
    }
  }

  /**
   * Find tsconfig.json in the project directory
   * @param projectDir - Project directory
   * @returns Path to tsconfig.json
   * @private
   */
  private _findTsConfig(projectDir: string): string {
    const tsconfigPath = path.join(projectDir, 'tsconfig.json');
    if (!FileSystem.exists(tsconfigPath)) {
      throw new DocumentationError(
        'tsconfig.json not found at project root',
        ErrorCode.CONFIG_NOT_FOUND
      );
    }
    return tsconfigPath;
  }

  /**
   * Validate TypeScript configuration and compile
   *
   * @param projectDir - Project directory
   * @param tsconfigPath - Path to tsconfig.json from config
   * @private
   */
  private async _validateAndCompileTypeScript(
    projectDir: string,
    tsconfigPath?: string
  ): Promise<void> {
    const spinner = clack.spinner();

    try {
      // Validate tsconfig
      spinner.start('Validating TypeScript configuration');
      const validation = await TsConfigHelper.validateAndFix({
        projectDir,
        tsconfigPath,
        interactive: true // GenerateAction is always interactive
      });
      spinner.stop('TypeScript configuration validated');

      // Compile TypeScript
      spinner.start('Compiling TypeScript');

      const { execFileSync } = await import('child_process');

      // Use execFileSync with array arguments to prevent command injection
      execFileSync('npx', ['tsc', '--project', validation.tsconfigPath], {
        cwd: projectDir,
        stdio: 'inherit'
      });

      // Copy custom .d.ts files to preserve type definitions that shouldn't be auto-generated
      // This is necessary because TypeScript auto-generates .d.ts for .jsx files,
      // but we have custom type definitions in src/components/*.d.ts
      const componentsSrc = path.join(projectDir, 'src', 'components');
      const componentsDest = path.join(projectDir, 'lib', 'components');
      if (FileSystem.exists(componentsSrc)) {
        const customDtsFiles = FileSystem.readFolderItemNames(componentsSrc)
          .filter(f => f.endsWith('.d.ts'));

        for (const dtsFile of customDtsFiles) {
          const srcPath = path.join(componentsSrc, dtsFile);
          const destPath = path.join(componentsDest, dtsFile);
          FileSystem.copyFile({
            sourcePath: srcPath,
            destinationPath: destPath
          });
        }
      }

      spinner.stop('TypeScript compilation completed');
    } catch (error) {
      spinner.stop('Validation/compilation failed');
      throw error;
    }
  }

  /**
   * Runs OpenDocs extractor to generate opendocs.json
   *
   * @param tsconfigPath - Path to tsconfig.json
   * @param outputPath - Path to output opendocs.json
   * @param config - Loaded configuration
   * @private
   */
  private async _runOpenDocsExtractor(
    tsconfigPath: string,
    outputPath: string,
    config: any
  ): Promise<void> {
    const extractorSpinner = clack.spinner();
    extractorSpinner.start('Running OpenDocs extractor');

    try {
      await OpenDocsExtractorService.run({
        tsconfigPath,
        outputPath,
        projectName: config.projectName,
        projectId: config.projectId,
        repoUrl: config.repoUrl,
        fileUrlTemplate: config.fileUrlTemplate,
      });

      extractorSpinner.stop('OpenDocs extraction completed');
    } catch (error) {
      extractorSpinner.stop('OpenDocs extraction failed');
      if (error instanceof DocumentationError) {
        throw error;
      }
      throw new DocumentationError(
        `Failed to run OpenDocs extraction: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCode.COMMAND_FAILED
      );
    }
  }
}
