#!/usr/bin/env node

import { Command } from 'commander';
import { extractDocumentation } from './extractor';
import * as fs from 'fs';
import * as path from 'path';

interface ExtractOptions {
  config: string;
  output: string;
  projectName?: string;
  projectId?: string;
  repoUrl?: string;
  repoType?: string;
  fileUrlTemplate?: string;
}

const program = new Command();

program
  .name('opendocs-extract-ts')
  .description('Extract OpenDocs documentation from TypeScript/JavaScript projects')
  .version('0.2.0');

program
  .command('extract')
  .description('Extract documentation from a TypeScript project')
  .option('-c, --config <path>', 'Path to tsconfig.json', './tsconfig.json')
  .option('-o, --output <path>', 'Output file path', './opendocs.json')
  .option('-p, --project-name <name>', 'Project name')
  .option('-i, --project-id <id>', 'Project ID')
  .option('--repo-url <url>', 'Repository URL')
  .option('--repo-type <type>', 'Repository type', 'git')
  .option('--file-url-template <template>', 'File URL template')
  .action(async (options: ExtractOptions) => {
    try {
      console.log('Extracting documentation...');
      console.log(`Config: ${options.config}`);
      console.log(`Output: ${options.output}`);

      // Ensure the tsconfig exists
      if (!fs.existsSync(options.config)) {
        console.error(`Error: tsconfig.json not found at ${options.config}`);
        process.exit(1);
      }

      // Extract documentation
      const docSet = await extractDocumentation({
        tsconfigPath: path.resolve(options.config),
        projectName: options.projectName,
        projectId: options.projectId,
        repoUrl: options.repoUrl,
        repoType: options.repoType,
        fileUrlTemplate: options.fileUrlTemplate,
      });

      // Write output
      const outputPath = path.resolve(options.output);
      const outputDir = path.dirname(outputPath);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(docSet, null, 2), 'utf-8');

      console.log(`✓ Documentation extracted successfully to ${outputPath}`);
      console.log(`  Projects: ${docSet.projects.length}`);
      console.log(
        `  Total items: ${docSet.projects.reduce((sum: number, p) => sum + (p.items?.length || 0), 0)}`
      );
    } catch (error) {
      console.error('Error extracting documentation:', error);
      process.exit(1);
    }
  });

program.parse();
