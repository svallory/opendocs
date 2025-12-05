import {
  DocSet,
  DocSetUtils,
  Project,
  SupportedLanguages,
  DocItem,
  ItemKind,
  DocBlock,
  DocTag,
  CommonTags,
} from '@opendocs/model';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

export interface ExtractorOptions {
  tsconfigPath: string;
  projectName?: string;
  projectId?: string;
}

/**
 * Extract OpenDocs documentation from a TypeScript project
 */
export async function extractDocumentation(options: ExtractorOptions): Promise<DocSet> {
  const { tsconfigPath, projectName, projectId } = options;

  // Read and parse tsconfig
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(`Error reading tsconfig: ${configFile.error.messageText}`);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  // Create TypeScript program
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  const checker = program.getTypeChecker();

  // Create DocSet
  const docSet = DocSetUtils.create({
    id: projectId || path.basename(path.dirname(tsconfigPath)),
    name: projectName || path.basename(path.dirname(tsconfigPath)),
    generator: {
      name: '@opendocs/extractor-typescript',
      version: '0.1.0',
    },
  });

  // Create Project
  const project: Project = {
    id: projectId || path.basename(path.dirname(tsconfigPath)),
    name: projectName || path.basename(path.dirname(tsconfigPath)),
    language: SupportedLanguages.TYPESCRIPT,
    version: getPackageVersion(path.dirname(tsconfigPath)),
    items: [],
  };

  // Extract documentation from source files
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
      const items = extractFromSourceFile(sourceFile, checker);
      project.items?.push(...items);
    }
  }

  docSet.projects.push(project);

  return docSet;
}

/**
 * Extract documentation items from a source file
 */
function extractFromSourceFile(sourceFile: ts.SourceFile, checker: ts.TypeChecker): DocItem[] {
  const items: DocItem[] = [];

  ts.forEachChild(sourceFile, (node) => {
    const item = extractFromNode(node, sourceFile, checker);
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
  checker: ts.TypeChecker
): DocItem | null {
  // Only process exported declarations
  if (!isNodeExported(node)) {
    return null;
  }

  let item: DocItem | null = null;

  if (ts.isClassDeclaration(node) && node.name) {
    item = extractClass(node, sourceFile, checker);
  } else if (ts.isFunctionDeclaration(node) && node.name) {
    item = extractFunction(node, sourceFile, checker);
  } else if (ts.isInterfaceDeclaration(node)) {
    item = extractInterface(node, sourceFile, checker);
  } else if (ts.isEnumDeclaration(node)) {
    item = extractEnum(node, sourceFile, checker);
  } else if (ts.isTypeAliasDeclaration(node)) {
    item = extractTypeAlias(node, sourceFile, checker);
  }

  return item;
}

/**
 * Extract a class declaration
 */
function extractClass(
  node: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  const name = node.name?.text || 'AnonymousClass';
  const symbol = checker.getSymbolAtLocation(node.name!);

  const item: DocItem = {
    id: name,
    name,
    kind: ItemKind.CLASS,
    location: getLocation(node, sourceFile),
    docBlock: extractDocBlock(node),
    items: [],
  };

  // Extract members
  node.members.forEach((member) => {
    const memberItem = extractClassMember(member, sourceFile, checker);
    if (memberItem) {
      item.items?.push(memberItem);
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
  checker: ts.TypeChecker
): DocItem | null {
  if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
    return extractMethod(member, sourceFile, checker);
  } else if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
    return extractProperty(member, sourceFile, checker);
  } else if (ts.isConstructorDeclaration(member)) {
    return extractConstructor(member, sourceFile, checker);
  }

  return null;
}

/**
 * Extract a method declaration
 */
function extractMethod(
  node: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  const name = (node.name as ts.Identifier).text;

  return {
    id: name,
    name,
    kind: ItemKind.METHOD,
    location: getLocation(node, sourceFile),
    visibility: getVisibility(node),
    isStatic: hasModifier(node, ts.SyntaxKind.StaticKeyword),
    docBlock: extractDocBlock(node),
    signature: {
      parameters: extractParameters(node, checker),
      returnType: extractReturnType(node, checker),
    },
  };
}

/**
 * Extract a property declaration
 */
function extractProperty(
  node: ts.PropertyDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  const name = (node.name as ts.Identifier).text;

  return {
    id: name,
    name,
    kind: ItemKind.PROPERTY,
    location: getLocation(node, sourceFile),
    visibility: getVisibility(node),
    isStatic: hasModifier(node, ts.SyntaxKind.StaticKeyword),
    isReadonly: hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
    docBlock: extractDocBlock(node),
    type: node.type ? { name: node.type.getText() } : undefined,
  };
}

/**
 * Extract a constructor declaration
 */
function extractConstructor(
  node: ts.ConstructorDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  return {
    id: 'constructor',
    name: 'constructor',
    kind: ItemKind.CONSTRUCTOR,
    location: getLocation(node, sourceFile),
    visibility: getVisibility(node),
    docBlock: extractDocBlock(node),
    signature: {
      parameters: extractParameters(node, checker),
    },
  };
}

/**
 * Extract a function declaration
 */
function extractFunction(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  const name = node.name?.text || 'AnonymousFunction';

  return {
    id: name,
    name,
    kind: ItemKind.FUNCTION,
    location: getLocation(node, sourceFile),
    docBlock: extractDocBlock(node),
    signature: {
      parameters: extractParameters(node, checker),
      returnType: extractReturnType(node, checker),
    },
  };
}

/**
 * Extract an interface declaration
 */
function extractInterface(
  node: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): DocItem {
  const name = node.name.text;

  const item: DocItem = {
    id: name,
    name,
    kind: ItemKind.INTERFACE,
    location: getLocation(node, sourceFile),
    docBlock: extractDocBlock(node),
    items: [],
  };

  // Extract members
  node.members.forEach((member) => {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      item.items?.push({
        id: member.name.text,
        name: member.name.text,
        kind: ItemKind.PROPERTY,
        type: member.type ? { name: member.type.getText() } : undefined,
        docBlock: extractDocBlock(member),
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
  checker: ts.TypeChecker
): DocItem {
  const name = node.name.text;

  const item: DocItem = {
    id: name,
    name,
    kind: ItemKind.ENUM,
    location: getLocation(node, sourceFile),
    docBlock: extractDocBlock(node),
    items: [],
  };

  // Extract enum members
  node.members.forEach((member) => {
    if (ts.isIdentifier(member.name)) {
      item.items?.push({
        id: member.name.text,
        name: member.name.text,
        kind: ItemKind.ENUM_MEMBER,
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
  checker: ts.TypeChecker
): DocItem {
  const name = node.name.text;

  return {
    id: name,
    name,
    kind: ItemKind.TYPE_ALIAS,
    location: getLocation(node, sourceFile),
    docBlock: extractDocBlock(node),
    type: { name: node.type.getText() },
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

  const docBlock: DocBlock = {
    tags: [],
  };

  // Extract description from JSDoc comment
  for (const comment of jsDocComments) {
    if (ts.isJSDoc(comment) && comment.comment) {
      const commentText =
        typeof comment.comment === 'string'
          ? comment.comment
          : comment.comment.map((c) => c.text).join('');
      docBlock.description = commentText;
      break;
    }
  }

  // Extract tags
  for (const tag of jsDocTags) {
    const tagName = tag.tagName.text;
    const commentText =
      typeof tag.comment === 'string'
        ? tag.comment
        : tag.comment?.map((c) => c.text).join('') || '';

    const docTag: DocTag = {
      tag: tagName,
      content: commentText,
    };

    // Extract additional info for specific tags
    if (ts.isJSDocParameterTag(tag) && tag.name && ts.isIdentifier(tag.name)) {
      docTag.name = tag.name.text;
      if (tag.typeExpression) {
        docTag.type = tag.typeExpression.getText();
      }
    }

    docBlock.tags?.push(docTag);
  }

  return docBlock.description || docBlock.tags?.length ? docBlock : undefined;
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
  sourceFile: ts.SourceFile
): { file: string; line: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return {
    file: sourceFile.fileName,
    line: line + 1,
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
