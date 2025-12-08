import {
  DocSet,
  DocSetUtils,
  Project,
  SupportedLanguages,
  DocItem,
  ItemKind,
  DocBlock,
  DocTag,
} from '@opendocs/model';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export interface ExtractorOptions {
  tsconfigPath: string;
  projectName?: string;
  projectId?: string;
  repoUrl?: string;
  repoType?: string;
  fileUrlTemplate?: string;
}

/**
 * Context for tracking FQN generation during extraction
 */
interface ExtractionContext {
  packageName: string;      // From package.json
  projectRoot: string;       // Project root directory
  parentIds: string[];       // Stack of parent FQNs for nested items
}

/**
 * Build a fully qualified name for a DocItem
 * Format: package#Symbol or package#Parent#Child
 */
function buildFQN(context: ExtractionContext, name: string): string {
  const { packageName, parentIds } = context;

  if (parentIds.length === 0) {
    return `${packageName}#${name}`;  // Top-level: package#Symbol
  }

  const parentFQN = parentIds[parentIds.length - 1];
  return `${parentFQN}#${name}`;  // Nested: parent#child
}

/**
 * Extract OpenDocs documentation from a TypeScript project
 */
export async function extractDocumentation(options: ExtractorOptions): Promise<DocSet> {
  const { tsconfigPath, projectName, projectId, repoUrl, repoType, fileUrlTemplate } = options;
  const projectRoot = path.dirname(tsconfigPath);
  const packageName = getPackageName(projectRoot);

  // Read and parse tsconfig
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Error reading tsconfig: ${configFile.error.messageText}`);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot
  );

  // Create TypeScript program
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  const checker = program.getTypeChecker();

  // Create DocSet
  const docSet = DocSetUtils.create({
    id: projectId || projectName || path.basename(projectRoot),
    name: projectName || path.basename(projectRoot),
    generator: {
      name: '@opendocs/extractor-typescript',
      version: '0.2.0',
    },
  });

  // Create Project
  const project: Project = {
    id: projectId || projectName || path.basename(projectRoot),
    name: projectName || path.basename(projectRoot),
    language: SupportedLanguages.TYPESCRIPT,
    version: getPackageVersion(projectRoot),
    items: [],
  };

  // Add repository info if provided
  if (repoUrl) {
    project.repository = {
      type: repoType || 'git',
      url: repoUrl,
      ...(fileUrlTemplate && { fileUrlTemplate }),
    };
  }

  // Create extraction context
  const context: ExtractionContext = {
    packageName,
    projectRoot,
    parentIds: [],
  };

  // Extract documentation from source files
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
      const items = extractFromSourceFile(sourceFile, checker, context);
      project.items?.push(...items);
    }
  }

  docSet.projects.push(project);

  return docSet;
}

/**
 * Extract documentation items from a source file
 */
function extractFromSourceFile(sourceFile: ts.SourceFile, checker: ts.TypeChecker, context: ExtractionContext): DocItem[] {
  const items: DocItem[] = [];

  ts.forEachChild(sourceFile, (node) => {
    const item = extractFromNode(node, sourceFile, checker, context);
    if (item) {
      items.push(item);
    }
  });

  return items;
}

/**
 * Extract a DocItem from a TypeScript node
 */
function extractFromNode(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem | null {
  // Only process exported declarations
  if (!isNodeExported(node)) {
    return null;
  }

  let item: DocItem | null = null;

  if (ts.isClassDeclaration(node) && node.name) {
    item = extractClass(node, sourceFile, checker, context);
  } else if (ts.isFunctionDeclaration(node) && node.name) {
    item = extractFunction(node, sourceFile, checker, context);
  } else if (ts.isInterfaceDeclaration(node)) {
    item = extractInterface(node, sourceFile, checker, context);
  } else if (ts.isEnumDeclaration(node)) {
    item = extractEnum(node, sourceFile, checker, context);
  } else if (ts.isTypeAliasDeclaration(node)) {
    item = extractTypeAlias(node, sourceFile, checker, context);
  }

  return item;
}

/**
 * Extract a class declaration
 */
function extractClass(
  node: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = node.name?.text || 'AnonymousClass';
  const fqn = buildFQN(context, name);

  // Create a new context for nested items
  const nestedContext: ExtractionContext = {
    ...context,
    parentIds: [...context.parentIds, fqn],
  };

  const item: DocItem = {
    id: fqn,
    name,
    kind: ItemKind.CLASS,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    children: [],
  };

  // Extract members
  node.members.forEach((member) => {
    const memberItem = extractClassMember(member, sourceFile, checker, nestedContext);
    if (memberItem) {
      memberItem.parentId = fqn;
      item.children?.push(memberItem);
    }
  });

  return item;
}

/**
 * Extract a class member (method, property, etc.)
 */
function extractClassMember(
  member: ts.ClassElement,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem | null {
  if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
    return extractMethod(member, sourceFile, checker, context);
  } else if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
    return extractProperty(member, sourceFile, checker, context);
  } else if (ts.isConstructorDeclaration(member)) {
    return extractConstructor(member, sourceFile, checker, context);
  }

  return null;
}

/**
 * Extract a method declaration
 */
function extractMethod(
  node: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = (node.name as ts.Identifier).text;
  const fqn = buildFQN(context, name);

  return {
    id: fqn,
    name,
    kind: ItemKind.METHOD,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    metadata: {
      visibility: getVisibility(node),
      isStatic: hasModifier(node, ts.SyntaxKind.StaticKeyword),
      signature: {
        parameters: extractParameters(node, checker),
        returnType: extractReturnType(node, checker),
      },
    },
  };
}

/**
 * Extract a property declaration
 */
function extractProperty(
  node: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = (node.name as ts.Identifier).text;
  const fqn = buildFQN(context, name);

  return {
    id: fqn,
    name,
    kind: ItemKind.PROPERTY,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    metadata: {
      visibility: getVisibility(node),
      isStatic: hasModifier(node, ts.SyntaxKind.StaticKeyword),
      isReadonly: hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
      type: node.type ? { name: node.type.getText() } : undefined,
    },
  };
}

/**
 * Extract a constructor declaration
 */
function extractConstructor(
  node: ts.ConstructorDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const fqn = buildFQN(context, 'constructor');

  return {
    id: fqn,
    name: 'constructor',
    kind: ItemKind.CONSTRUCTOR,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    metadata: {
      visibility: getVisibility(node),
      signature: {
        parameters: extractParameters(node, checker),
      },
    },
  };
}

/**
 * Extract a function declaration
 */
function extractFunction(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = node.name?.text || 'AnonymousFunction';
  const fqn = buildFQN(context, name);

  return {
    id: fqn,
    name,
    kind: ItemKind.FUNCTION,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    metadata: {
      signature: {
        parameters: extractParameters(node, checker),
        returnType: extractReturnType(node, checker),
      },
    },
  };
}

/**
 * Extract an interface declaration
 */
function extractInterface(
  node: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = node.name.text;
  const fqn = buildFQN(context, name);

  // Create a new context for nested items
  const nestedContext: ExtractionContext = {
    ...context,
    parentIds: [...context.parentIds, fqn],
  };

  const item: DocItem = {
    id: fqn,
    name,
    kind: ItemKind.INTERFACE,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    children: [],
  };

  // Extract members
  node.members.forEach((member) => {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      const memberFQN = buildFQN(nestedContext, member.name.text);
      item.children?.push({
        id: memberFQN,
        name: member.name.text,
        kind: ItemKind.PROPERTY,
        language: SupportedLanguages.TYPESCRIPT,
        location: getLocation(member, sourceFile, context.projectRoot),
        parentId: fqn,
        docBlock: extractDocBlock(member),
        metadata: {
          type: member.type ? { name: member.type.getText() } : undefined,
        },
      });
    }
  });

  return item;
}

/**
 * Extract an enum declaration
 */
function extractEnum(
  node: ts.EnumDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = node.name.text;
  const fqn = buildFQN(context, name);

  // Create a new context for nested items
  const nestedContext: ExtractionContext = {
    ...context,
    parentIds: [...context.parentIds, fqn],
  };

  const item: DocItem = {
    id: fqn,
    name,
    kind: ItemKind.ENUM,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    children: [],
  };

  // Extract enum members
  node.members.forEach((member) => {
    if (ts.isIdentifier(member.name)) {
      const memberFQN = buildFQN(nestedContext, member.name.text);
      item.children?.push({
        id: memberFQN,
        name: member.name.text,
        kind: ItemKind.ENUM_MEMBER,
        language: SupportedLanguages.TYPESCRIPT,
        location: getLocation(member, sourceFile, context.projectRoot),
        parentId: fqn,
        docBlock: extractDocBlock(member),
      });
    }
  });

  return item;
}

/**
 * Extract a type alias declaration
 */
function extractTypeAlias(
  node: ts.TypeAliasDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  context: ExtractionContext
): DocItem {
  const name = node.name.text;
  const fqn = buildFQN(context, name);

  return {
    id: fqn,
    name,
    kind: ItemKind.TYPE_ALIAS,
    language: SupportedLanguages.TYPESCRIPT,
    location: getLocation(node, sourceFile, context.projectRoot),
    docBlock: extractDocBlock(node),
    metadata: {
      type: { name: node.type.getText() },
    },
  };
}

/**
 * Extract JSDoc comments into a DocBlock
 */
function extractDocBlock(node: ts.Node): DocBlock | undefined {
  const jsDocTags = ts.getJSDocTags(node);
  const jsDocComments = ts.getJSDocCommentsAndTags(node);

  if (jsDocComments.length === 0) {
    return undefined;
  }

  const docBlock: DocBlock = {};

  // Extract content from JSDoc comment
  for (const comment of jsDocComments) {
    if (ts.isJSDoc(comment) && comment.comment) {
      const commentText =
        typeof comment.comment === 'string'
          ? comment.comment
          : comment.comment.map((c) => c.text).join('');
      docBlock.content = commentText;
      break;
    }
  }

  // Tags - use Record<string, (string | DocTag)[]> format per spec
  const tags: Record<string, any[]> = {};

  // Extract tags
  for (const tag of jsDocTags) {
    const tagName = tag.tagName.text;
    const commentText =
      typeof tag.comment === 'string'
        ? tag.comment
        : tag.comment?.map((c) => c.text).join('') || '';

    // Handle @param tags specially
    if (ts.isJSDocParameterTag(tag) && tag.name && ts.isIdentifier(tag.name)) {
      const docTag: DocTag = {
        name: tagName,
        content: commentText,
        parameters: {
          name: tag.name.text,
        },
      };

      if (tag.typeExpression) {
        docTag.parameters!.type = tag.typeExpression.getText();
      }

      if (!tags[tagName]) {
        tags[tagName] = [];
      }
      tags[tagName].push(docTag);
    } else if (tagName === 'returns' || tagName === 'return') {
      // Simple string for returns per spec examples
      if (!tags.returns) {
        tags.returns = [];
      }
      tags.returns.push(commentText);
    } else {
      // Other tags
      const docTag: DocTag = {
        name: tagName,
        content: commentText,
      };

      if (!tags[tagName]) {
        tags[tagName] = [];
      }
      tags[tagName].push(docTag);
    }
  }

  if (Object.keys(tags).length > 0) {
    docBlock.tags = tags;
  }

  return docBlock.content || docBlock.tags ? docBlock : undefined;
}

/**
 * Extract parameters from a function-like declaration
 */
function extractParameters(
  node: ts.FunctionLikeDeclaration,
  checker: ts.TypeChecker
): any[] {
  return node.parameters.map((param) => ({
    name: param.name.getText(),
    type: param.type ? { name: param.type.getText() } : undefined,
    isOptional: !!param.questionToken,
    isRest: !!param.dotDotDotToken,
  }));
}

/**
 * Extract return type from a function-like declaration
 */
function extractReturnType(node: ts.FunctionLikeDeclaration, checker: ts.TypeChecker): any {
  if (node.type) {
    return { name: node.type.getText() };
  }
  return undefined;
}

/**
 * Get source location for a node
 */
function getLocation(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  projectRoot: string
): { path: string; number: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return {
    path: path.relative(projectRoot, sourceFile.fileName),
    number: line + 1,
    column: character + 1,
  };
}

/**
 * Get visibility modifier
 */
function getVisibility(node: ts.Node): 'public' | 'private' | 'protected' | undefined {
  if (hasModifier(node, ts.SyntaxKind.PrivateKeyword)) return 'private';
  if (hasModifier(node, ts.SyntaxKind.ProtectedKeyword)) return 'protected';
  if (hasModifier(node, ts.SyntaxKind.PublicKeyword)) return 'public';
  return 'public'; // Default in TypeScript
}

/**
 * Check if a node has a specific modifier
 */
function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return (
    ts.canHaveModifiers(node) &&
    !!ts.getModifiers(node)?.some((mod) => mod.kind === kind)
  );
}

/**
 * Check if a node is exported
 */
function isNodeExported(node: ts.Node): boolean {
  return hasModifier(node, ts.SyntaxKind.ExportKeyword) || hasModifier(node, ts.SyntaxKind.DefaultKeyword);
}

/**
 * Get package version from package.json
 */
function getPackageVersion(dir: string): string | undefined {
  const packageJsonPath = path.join(dir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.version;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Get package name from package.json for FQN generation
 */
function getPackageName(dir: string): string {
  const packageJsonPath = path.join(dir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.name || path.basename(dir);
    } catch {
      return path.basename(dir);
    }
  }
  return path.basename(dir);
}
