import { DocSet, DocItem, DocBlock, RelationUtils } from '@opendocs/model';
import { ITemplateData, ITableRow, IReturnData } from '../templates/TemplateEngine';
import type { DocSegment } from '../utils/DocSectionConverter';
import { InheritanceResolver } from './InheritanceResolver';

/**
 * Adapts OpenDocs DocItems to ITemplateData for template rendering
 *
 * Maintains full compatibility with existing Liquid/EJS templates by converting
 * OpenDocs structure to the exact format expected by mint-tsdocs templates.
 *
 * This is the bridge between OpenDocs universal model and mint-tsdocs templates.
 */
export class OpenDocsAdapter {
  private readonly _docSet: DocSet;
  private readonly _inheritanceResolver: InheritanceResolver;

  constructor(docSet: DocSet) {
    this._docSet = docSet;
    this._inheritanceResolver = new InheritanceResolver(docSet);
  }

  /**
   * Convert a DocItem to ITemplateData
   *
   * Maps OpenDocs structure to api-extractor-compatible template data format.
   */
  convertToTemplateData(
    item: DocItem,
    options: {
      pageTitle: string;
      pageDescription: string;
      pageIcon: string;
      breadcrumb: Array<{ name: string; path?: string }>;
      navigation?: { id: string; title: string; group?: string };
      getLinkFilenameForApiItem: (itemId: string) => string | undefined;
    }
  ): ITemplateData {
    // Resolve @inheritDoc if present
    const resolvedItem = this._resolveInheritDoc(item);

    const baseData: ITemplateData = {
      apiItem: {
        name: item.name,
        kind: item.kind,
        displayName: item.name,
        description: this._getDescription(resolvedItem),
        summary: this._getSummary(resolvedItem),
        remarks: this._getRemarks(resolvedItem),
        signature: this._getSignature(item),
        isDeprecated: this._isDeprecated(resolvedItem),
        isAlpha: this._isAlpha(item),
        isBeta: this._isBeta(item),
        releaseTag: this._getReleaseTag(item),
      },
      page: options,
      navigation: options.navigation,
      examples: this._getExamples(resolvedItem),
      heritageTypes: this._getHeritageTypes(item, options.getLinkFilenameForApiItem),
      guides: this._extractGuideLinks(resolvedItem),
    };

    // Add type-specific data based on kind
    return this._addKindSpecificData(baseData, item, options.getLinkFilenameForApiItem);
  }

  /**
   * Resolve @inheritDoc tag by finding and merging documentation from referenced item
   */
  private _resolveInheritDoc(item: DocItem): DocItem {
    // Check for @inheritDoc tag
    const inheritDocTags = item.docBlock?.tags?.['inheritDoc'];
    if (!inheritDocTags || inheritDocTags.length === 0) {
      return item;
    }

    // Get target from first @inheritDoc tag
    const targetRef = typeof inheritDocTags[0] === 'string'
      ? inheritDocTags[0]
      : (inheritDocTags[0] as any).content;

    // Resolve target item
    const targetItem = this._inheritanceResolver.resolveReference(targetRef, item);
    if (!targetItem) {
      console.warn(`Could not resolve @inheritDoc reference: ${targetRef}`);
      return item;
    }

    // Merge documentation
    return {
      ...item,
      docBlock: this._mergeDocBlocks(item.docBlock, targetItem.docBlock),
    };
  }

  /**
   * Merge two DocBlocks, with target taking precedence over source
   */
  private _mergeDocBlocks(
    target: DocBlock | undefined,
    source: DocBlock | undefined
  ): DocBlock | undefined {
    if (!source) return target;
    if (!target) return source;

    return {
      content: target.content || source.content,
      tags: {
        ...source.tags,
        ...target.tags,
        // Remove inheritDoc tag after resolution
        inheritDoc: undefined,
      },
    };
  }

  /**
   * Get plain text description from docBlock
   */
  private _getDescription(item: DocItem): string {
    return item.docBlock?.content || '';
  }

  /**
   * Convert docBlock content to DocSegment array for templates
   */
  private _getSummary(item: DocItem): DocSegment[] {
    if (!item.docBlock?.content) return [];

    return [
      {
        kind: 'Paragraph',
        props: { text: item.docBlock.content },
      },
    ];
  }

  /**
   * Get remarks from @remarks tag
   */
  private _getRemarks(item: DocItem): DocSegment[] {
    const remarksTags = item.docBlock?.tags?.['remarks'];
    if (!remarksTags || remarksTags.length === 0) return [];

    const remarksContent = typeof remarksTags[0] === 'string'
      ? remarksTags[0]
      : (remarksTags[0] as any).content;

    return [
      {
        kind: 'Paragraph',
        props: { text: remarksContent },
      },
    ];
  }

  /**
   * Build signature string from metadata
   */
  private _getSignature(item: DocItem): string {
    const metadata = item.metadata as any;
    if (!metadata?.signature) return '';

    const params = metadata.signature.parameters || [];
    const returnType = metadata.signature.returnType;

    const paramStr = params
      .map((p: any) => {
        const optionalMark = p.isOptional ? '?' : '';
        const typeName = p.type?.name || 'any';
        return `${p.name}${optionalMark}: ${typeName}`;
      })
      .join(', ');

    const returnStr = returnType ? `: ${returnType.name}` : '';

    return `${item.name}(${paramStr})${returnStr}`;
  }

  /**
   * Check if item has @deprecated tag
   */
  private _isDeprecated(item: DocItem): boolean {
    return !!item.docBlock?.tags?.['deprecated'];
  }

  /**
   * Check if item is marked as @alpha
   */
  private _isAlpha(item: DocItem): boolean {
    return (item.metadata as any)?.releaseTag === 'alpha';
  }

  /**
   * Check if item is marked as @beta
   */
  private _isBeta(item: DocItem): boolean {
    return (item.metadata as any)?.releaseTag === 'beta';
  }

  /**
   * Get the release tag
   */
  private _getReleaseTag(item: DocItem): string {
    return (item.metadata as any)?.releaseTag || 'public';
  }

  /**
   * Extract examples from @example tags
   */
  private _getExamples(item: DocItem): string[] {
    const exampleTags = item.docBlock?.tags?.['example'];
    if (!exampleTags) return [];

    return exampleTags.map((tag) =>
      typeof tag === 'string' ? tag : (tag as any).content
    );
  }

  /**
   * Build heritage types array from relations
   */
  private _getHeritageTypes(
    item: DocItem,
    getLinkFilename: (itemId: string) => string | undefined
  ): Array<{ name: string; path?: string }> {
    if (!item.relations) return [];

    const heritageTypes: Array<{ name: string; path?: string }> = [];

    // Add extends relationships
    const extendsTargets = RelationUtils.getTargets(item.relations, 'extends');
    for (const target of extendsTargets) {
      heritageTypes.push({
        name: this._extractTypeName(target),
        path: getLinkFilename(target),
      });
    }

    // Add implements relationships
    const implementsTargets = RelationUtils.getTargets(item.relations, 'implements');
    for (const target of implementsTargets) {
      heritageTypes.push({
        name: this._extractTypeName(target),
        path: getLinkFilename(target),
      });
    }

    return heritageTypes;
  }

  /**
   * Extract simple name from FQN
   */
  private _extractTypeName(target: string): string {
    const parts = target.split('#');
    return parts[parts.length - 1];
  }

  /**
   * Extract guide links from @see tags
   */
  private _extractGuideLinks(item: DocItem): Array<{ path: string; description: string }> {
    const seeTags = item.docBlock?.tags?.['see'];
    if (!seeTags) return [];

    const guides: Array<{ path: string; description: string }> = [];

    for (const tag of seeTags) {
      const text = typeof tag === 'string' ? tag : (tag as any).content;

      // Parse "/path - description" format
      const match = text.match(/^\s*(\/\S+)\s+-\s+(.+)$/);
      if (match) {
        guides.push({
          path: match[1],
          description: match[2],
        });
      }
    }

    return guides;
  }

  /**
   * Add kind-specific data to template data
   */
  private _addKindSpecificData(
    data: ITemplateData,
    item: DocItem,
    getLinkFilename: (itemId: string) => string | undefined
  ): ITemplateData {
    const children = item.children || [];

    switch (item.kind) {
      case 'class':
        data.constructors = this._createTableRows(
          children.filter((c) => c.kind === 'constructor'),
          getLinkFilename
        );
        data.properties = this._createTableRows(
          children.filter((c) => c.kind === 'property'),
          getLinkFilename
        );
        data.methods = this._createTableRows(
          children.filter((c) => c.kind === 'method'),
          getLinkFilename
        );
        break;

      case 'interface':
        data.properties = this._createTableRows(
          children.filter((c) => c.kind === 'property'),
          getLinkFilename
        );
        data.methods = this._createTableRows(
          children.filter((c) => c.kind === 'method'),
          getLinkFilename
        );
        break;

      case 'enum':
        data.members = this._createTableRows(
          children.filter((c) => c.kind === 'enumMember'),
          getLinkFilename
        );
        break;

      case 'function':
      case 'method':
        const metadata = item.metadata as any;
        data.parameters = this._createParameterRows(
          metadata?.signature?.parameters || [],
          item
        );
        data.returnType = this._createReturnData(
          metadata?.signature?.returnType,
          item
        );
        break;

      case 'namespace':
      case 'module':
        // For namespace/module, categorize children
        data.classes = this._createTableRows(
          children.filter((c) => c.kind === 'class'),
          getLinkFilename
        );
        data.interfaces = this._createTableRows(
          children.filter((c) => c.kind === 'interface'),
          getLinkFilename
        );
        data.functions = this._createTableRows(
          children.filter((c) => c.kind === 'function'),
          getLinkFilename
        );
        data.enumerations = this._createTableRows(
          children.filter((c) => c.kind === 'enum'),
          getLinkFilename
        );
        data.typeAliases = this._createTableRows(
          children.filter((c) => c.kind === 'typeAlias'),
          getLinkFilename
        );
        data.variables = this._createTableRows(
          children.filter((c) => c.kind === 'variable'),
          getLinkFilename
        );
        break;
    }

    return data;
  }

  /**
   * Create table rows from DocItems
   */
  private _createTableRows(
    items: DocItem[],
    getLinkFilename: (itemId: string) => string | undefined
  ): ITableRow[] {
    return items.map((item) => {
      const metadata = item.metadata as any;
      const typeInfo = metadata?.type;

      return {
        title: item.name,
        titlePath: getLinkFilename(item.id),
        modifiers: this._getModifiers(metadata),
        type: typeInfo?.name,
        typeRef: undefined, // TODO: Implement type reference resolution
        typePath: undefined,
        description: item.docBlock?.content || '',
        isOptional: metadata?.isOptional,
        isInherited: false, // TODO: Implement inheritance checking
        isDeprecated: this._isDeprecated(item),
        defaultValue: metadata?.defaultValue,
      };
    });
  }

  /**
   * Create parameter rows for function/method
   */
  private _createParameterRows(parameters: any[], parentItem: DocItem): ITableRow[] {
    const paramTags = parentItem.docBlock?.tags?.['param'] || [];

    return parameters.map((param: any) => {
      // Find matching @param tag
      const paramTag = paramTags.find((tag) => {
        if (typeof tag === 'string') return false;
        return (tag as any).parameters?.name === param.name;
      });

      const description =
        paramTag && typeof paramTag !== 'string' ? (paramTag as any).content : '';

      return {
        title: param.name,
        type: param.type?.name || 'any',
        typeRef: undefined,
        typePath: undefined,
        description,
        isOptional: param.isOptional,
      };
    });
  }

  /**
   * Create return data for function/method
   */
  private _createReturnData(returnType: any, parentItem: DocItem): IReturnData {
    const returnTags = parentItem.docBlock?.tags?.['returns'];
    const description =
      returnTags && returnTags.length > 0
        ? typeof returnTags[0] === 'string'
          ? returnTags[0]
          : (returnTags[0] as any).content
        : '';

    return {
      type: returnType?.name || 'void',
      typeRef: undefined,
      typePath: undefined,
      description,
    };
  }

  /**
   * Get modifiers array from metadata
   */
  private _getModifiers(metadata: any): string[] {
    const modifiers: string[] = [];

    if (metadata?.isStatic) modifiers.push('static');
    if (metadata?.isAbstract) modifiers.push('abstract');
    if (metadata?.visibility === 'protected') modifiers.push('protected');
    if (metadata?.visibility === 'private') modifiers.push('private');
    if (metadata?.isReadonly) modifiers.push('readonly');

    return modifiers;
  }

  /**
   * Get cache statistics from InheritanceResolver
   */
  getCacheStats() {
    return this._inheritanceResolver.getCacheStats();
  }
}
