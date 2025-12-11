import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { describe, test, expect, beforeAll } from 'bun:test';

describe('Sandbox Integration Tests', () => {
  const extractorPath = path.join(__dirname, '../lib/cli.js');
  const sandboxPath = path.join(__dirname, '../../../../sandbox/typescript');
  const outputPath = path.join(sandboxPath, 'opendocs.json');

  beforeAll(() => {
    // Ensure the extractor is built
    try {
      execSync('npm run build', { cwd: path.dirname(__dirname) });
    } catch (error) {
      console.error('Failed to build extractor:', error);
      throw error;
    }
  });

  test('should extract TypeScript sandbox documentation', () => {
    // Run the extractor on the sandbox
    execSync(
      `node ${extractorPath} extract --config ${sandboxPath}/tsconfig.json --project-name test-library --output ${outputPath}`,
      { encoding: 'utf-8', cwd: sandboxPath }
    );

    // Read the generated output
    const extracted = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

    // Remove dynamic fields that change between runs
    if (extracted.metadata?.created) {
      delete extracted.metadata.created;
    }
    if (extracted.metadata?.modified) {
      delete extracted.metadata.modified;
    }

    // Compare against snapshot
    expect(extracted).toMatchSnapshot();
  });
});