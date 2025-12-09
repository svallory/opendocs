import * as path from 'path';
import { CommandLineFlagParameter, CommandLineStringParameter, CommandLineStringListParameter, CommandLineChoiceParameter } from '@rushstack/ts-command-line';
import { FileSystem } from '@rushstack/node-core-library';
import * as clack from '@clack/prompts';
import { minimatch } from 'minimatch';
import Table from 'cli-table3';
import { Colorize } from '@rushstack/terminal';

import { BaseAction } from './BaseAction';
import { DocumenterCli } from './ApiDocumenterCommandLine';
import { loadConfig } from '../config';
import { CoverageConfig, CoverageLevel, CoverageRule } from '../config/types';
import { DocumentationError, ErrorCode } from '../errors/DocumentationError';
import { showCliHeader } from './CliHelpers';
import { OpenDocsExtractorService } from './services/OpenDocsExtractorService';
import type { DocSet, DocItem } from '@opendocs/model';

interface CoverageItem {
    name: string;
    kind: string;
    sourceFile: string;
    isDocumented: boolean;
    releaseTag: string | undefined;
    level: CoverageLevel;
}

interface CoverageStats {
    total: number;
    documented: number;
    percentage: number;

    required: {
        total: number;
        documented: number;
        percentage: number;
    };
    desired: {
        total: number;
        documented: number;
        percentage: number;
    };
}

interface GroupedCoverage {
    [group: string]: {
        items: CoverageItem[];
        stats: CoverageStats;
    };
}

export class CoverageAction extends BaseAction {
    private readonly _parser: DocumenterCli;
    private readonly _thresholdParameter: CommandLineStringParameter;
    private readonly _includeParameter: CommandLineStringListParameter;
    private readonly _excludeParameter: CommandLineStringListParameter;
    private readonly _groupByParameter: CommandLineChoiceParameter;
    private readonly _jsonParameter: CommandLineFlagParameter;
    private readonly _skipExtractorParameter: CommandLineFlagParameter;
    private readonly _includePrivateParameter: CommandLineFlagParameter;
    private readonly _projectDirParameter: CommandLineStringParameter;

    public constructor(parser: DocumenterCli) {
        super({
            actionName: 'coverage',
            summary: 'Calculate TSDocs coverage for the project',
            documentation: 'Analyzes the project and reports the percentage of API items that have TSDoc comments.'
        });
        this._parser = parser;

        this._thresholdParameter = this.defineStringParameter({
            parameterLongName: '--threshold',
            argumentName: 'NUMBER',
            description: 'Minimum coverage percentage required to pass (overrides config)'
        });

        this._includeParameter = this.defineStringListParameter({
            parameterLongName: '--include',
            argumentName: 'GLOB',
            description: 'Glob pattern for files to include in coverage calculation'
        });

        this._excludeParameter = this.defineStringListParameter({
            parameterLongName: '--exclude',
            argumentName: 'GLOB',
            description: 'Glob pattern for files to exclude from coverage calculation'
        });

        this._groupByParameter = this.defineChoiceParameter({
            parameterLongName: '--group-by',
            description: 'How to group the coverage report',
            alternatives: ['file', 'folder', 'kind', 'none'],
            defaultValue: 'none'
        });

        this._jsonParameter = this.defineFlagParameter({
            parameterLongName: '--json',
            description: 'Output report in JSON format'
        });

        this._skipExtractorParameter = this.defineFlagParameter({
            parameterLongName: '--skip-extractor',
            description: 'Skip running OpenDocs extractor (use existing opendocs.json)'
        });

        this._includePrivateParameter = this.defineFlagParameter({
            parameterLongName: '--include-private',
            description: 'Include internal/private code (non-exported) in coverage analysis'
        });

        this._projectDirParameter = this.defineStringParameter({
            parameterLongName: '--project-dir',
            argumentName: 'PATH',
            description: 'Project directory containing mint-tsdocs.config.json'
        });
    }

    protected onDefineParameters(): void {
        // Parameters are now defined in the constructor
    }

    protected async onExecuteAsync(): Promise<void> {
        showCliHeader();

        const projectDir = this._projectDirParameter.value
            ? path.resolve(process.cwd(), this._projectDirParameter.value)
            : process.cwd();

        // Load config
        const config = loadConfig(projectDir);

        // Determine .tsdocs directory
        const tsdocsDir = config.docsJson
            ? path.join(path.dirname(config.docsJson), '.tsdocs')
            : path.join(projectDir, 'docs', '.tsdocs');

        // Load opendocs.json
        const openDocsPath = path.join(tsdocsDir, 'opendocs.json');
        if (!FileSystem.exists(openDocsPath)) {
            throw new DocumentationError(
                'No opendocs.json found. Run "opendocs-mintlify generate" first.',
                ErrorCode.FILE_NOT_FOUND
            );
        }

        const docSet = OpenDocsExtractorService.load(openDocsPath);

        // Calculate coverage
        const items = this._collectDocItems(docSet, config.coverage);
        const filteredItems = this._filterItems(items, config);

        // Grouping
        const groupBy = this._groupByParameter.value as 'file' | 'folder' | 'kind' | 'none' || config.coverage?.groupBy || 'none';
        const grouped = this._groupItems(filteredItems, groupBy);

        // Calculate stats
        const totalStats = this._calculateStats(filteredItems);

        // Threshold
        const threshold = this._thresholdParameter.value
            ? parseFloat(this._thresholdParameter.value)
            : (config.coverage?.threshold ?? 80);

        // Report
        if (this._jsonParameter.value) {
            this._reportJson(grouped, totalStats, threshold);
        } else {
            this._reportText(grouped, totalStats, threshold, groupBy);
        }

        // Exit code
        if (totalStats.required.percentage < threshold) {
            process.exitCode = 1;
        }
    }

    private _collectDocItems(docSet: DocSet, coverageConfig?: CoverageConfig): CoverageItem[] {
        const items: CoverageItem[] = [];
        const includeInternal = coverageConfig?.includeInternal ?? false;
        const rules = coverageConfig?.rules || [];

        const visit = (item: DocItem) => {
            // Skip container items
            if (item.kind === 'package' || item.kind === 'module') {
                // Still visit children
                if (item.children) {
                    for (const child of item.children) {
                        visit(child);
                    }
                }
                return;
            }

            const releaseTag = item.metadata?.releaseTag;

            // Determine coverage level based on rules
            const level = this._evaluateRuleForDocItem(item, releaseTag, rules, includeInternal);

            // Skip if optional
            if (level === 'optional') {
                // Still visit children
                if (item.children) {
                    for (const child of item.children) {
                        visit(child);
                    }
                }
                return;
            }

            // Get source file from item
            const sourceFile = item.source?.file || 'unknown';

            // Check if documented
            const isDocumented = !!(item.docBlock && item.docBlock.description);

            items.push({
                name: item.name,
                kind: item.kind,
                sourceFile,
                isDocumented,
                releaseTag,
                level
            });

            // Visit children
            if (item.children) {
                for (const child of item.children) {
                    visit(child);
                }
            }
        };

        // Visit all items in all projects
        for (const project of docSet.projects) {
            for (const item of project.items || []) {
                visit(item);
            }
        }

        return items;
    }

    private _evaluateRuleForDocItem(item: DocItem, releaseTag: string | undefined, rules: CoverageRule[], includeInternal: boolean): CoverageLevel {
        // For DocItems, we don't have TypeScript visibility modifiers directly
        // We'll check if the item has metadata indicating it's exported
        const isExported = item.metadata?.isExported !== false;  // Default to true
        const releaseTagString = releaseTag || 'none';

        // Check configured rules first
        for (const rule of rules) {
            // Check kind
            const kinds = Array.isArray(rule.kind) ? rule.kind : [rule.kind];
            if (!kinds.includes(item.kind as any)) {
                continue;
            }

            // Check TS visibility (for DocItems, we assume all exported items are 'public')
            if (rule.visibility) {
                const visibilities = Array.isArray(rule.visibility) ? rule.visibility : [rule.visibility];
                const itemVisibility = isExported ? 'public' : 'private';
                if (!visibilities.includes(itemVisibility)) {
                    continue;
                }
            }

            // Check release tag
            if (rule.releaseTag) {
                const tags = Array.isArray(rule.releaseTag) ? rule.releaseTag : [rule.releaseTag];
                if (!tags.includes(releaseTagString)) {
                    continue;
                }
            }

            return rule.level;
        }

        // Default behavior if no rules match
        if (releaseTagString === 'internal') {
            return includeInternal ? 'required' : 'optional';
        }

        return 'required';
    }

    private _filterItems(items: CoverageItem[], config: any): CoverageItem[] {
        const includes = this._includeParameter.values.length > 0
            ? this._includeParameter.values
            : (config.coverage?.include || []);

        const excludes = this._excludeParameter.values.length > 0
            ? this._excludeParameter.values
            : (config.coverage?.exclude || []);

        if (includes.length === 0 && excludes.length === 0) {
            return items;
        }

        return items.filter(item => {
            if (item.sourceFile === 'unknown') {
                return true;
            }

            let included = includes.length === 0;
            for (const pattern of includes) {
                if (minimatch(item.sourceFile, pattern)) {
                    included = true;
                    break;
                }
            }

            if (!included) return false;

            for (const pattern of excludes) {
                if (minimatch(item.sourceFile, pattern)) {
                    return false;
                }
            }

            return true;
        });
    }

    private _groupItems(items: CoverageItem[], groupBy: 'file' | 'folder' | 'kind' | 'none'): GroupedCoverage {
        const grouped: GroupedCoverage = {};

        for (const item of items) {
            let key = 'all';
            if (groupBy === 'file') {
                key = item.sourceFile;
            } else if (groupBy === 'folder') {
                key = path.dirname(item.sourceFile);
            } else if (groupBy === 'kind') {
                key = item.kind;
            }

            if (!grouped[key]) {
                grouped[key] = {
                    items: [],
                    stats: {
                        total: 0,
                        documented: 0,
                        percentage: 0,
                        required: { total: 0, documented: 0, percentage: 0 },
                        desired: { total: 0, documented: 0, percentage: 0 }
                    }
                };
            }

            grouped[key].items.push(item);
        }

        for (const key in grouped) {
            grouped[key].stats = this._calculateStats(grouped[key].items);
        }

        return grouped;
    }

    private _calculateStats(items: CoverageItem[]): CoverageStats {
        const total = items.length;
        const documented = items.filter(i => i.isDocumented).length;

        const requiredItems = items.filter(i => i.level === 'required');
        const requiredTotal = requiredItems.length;
        const requiredDocumented = requiredItems.filter(i => i.isDocumented).length;

        const desiredItems = items.filter(i => i.level === 'desired');
        const desiredTotal = desiredItems.length;
        const desiredDocumented = desiredItems.filter(i => i.isDocumented).length;

        return {
            total,
            documented,
            percentage: total === 0 ? 100 : (documented / total) * 100,
            required: {
                total: requiredTotal,
                documented: requiredDocumented,
                percentage: requiredTotal === 0 ? 100 : (requiredDocumented / requiredTotal) * 100
            },
            desired: {
                total: desiredTotal,
                documented: desiredDocumented,
                percentage: desiredTotal === 0 ? 100 : (desiredDocumented / desiredTotal) * 100
            }
        };
    }

    private _reportText(grouped: GroupedCoverage, totalStats: CoverageStats, threshold: number, groupBy: string): void {
        // Determine column header based on grouping
        const groupHeader = groupBy === 'file' ? 'File' :
                           groupBy === 'folder' ? 'Folder' :
                           groupBy === 'kind' ? 'Type' :
                           'Type';

        clack.log.message('');
        clack.log.message(Colorize.bold(`API Surface Coverage (Threshold: ${threshold}%)`));
        clack.log.message('');

        const table = new Table({
            head: [groupHeader, 'Total', 'Documented', 'Undocumented', 'Coverage'],
            style: {
                head: ['cyan'],
                border: [],
                compact: false
            }
        });

        // Sort entries - put 'all' last if it exists
        const entries = Object.entries(grouped).sort(([keyA], [keyB]) => {
            if (keyA === 'all') return 1;
            if (keyB === 'all') return -1;
            return keyA.localeCompare(keyB);
        });

        // Add individual groups first
        for (const [group, data] of entries) {
            if (group === 'all') continue; // Skip 'all' for now, will add as TOTAL at end

            const { total, documented } = data.stats;
            const undocumented = total - documented;
            const percentage = data.stats.percentage;

            // Color code the coverage percentage
            const coverageColor = percentage >= threshold ? Colorize.green :
                                 percentage >= 50 ? Colorize.yellow :
                                 Colorize.red;

            table.push([
                group,
                total.toString(),
                documented.toString(),
                undocumented.toString(),
                coverageColor(`${percentage.toFixed(1)}%`)
            ]);
        }

        // Always add TOTAL line at the end
        const { total, documented } = totalStats;
        const undocumented = total - documented;
        const percentage = totalStats.percentage;
        const coverageColor = percentage >= threshold ? Colorize.green :
                             percentage >= 50 ? Colorize.yellow :
                             Colorize.red;

        table.push([
            Colorize.bold('TOTAL'),
            Colorize.bold(total.toString()),
            Colorize.bold(documented.toString()),
            Colorize.bold(undocumented.toString()),
            Colorize.bold(coverageColor(`${percentage.toFixed(1)}%`))
        ]);

        clack.log.message(table.toString());
        clack.log.message('');

        if (totalStats.percentage < threshold) {
            clack.log.error(`Coverage check failed: ${totalStats.percentage.toFixed(1)}% < ${threshold}%`);
        } else {
            clack.log.success(`Coverage check passed: ${totalStats.percentage.toFixed(1)}%`);
        }
    }

    private _reportJson(grouped: GroupedCoverage, totalStats: CoverageStats, threshold: number): void {
        const output = {
            threshold,
            stats: totalStats,
            groups: grouped,
            success: totalStats.required.percentage >= threshold
        };
        console.log(JSON.stringify(output, null, 2));
    }
}
