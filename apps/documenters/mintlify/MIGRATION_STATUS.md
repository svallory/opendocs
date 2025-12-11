# Migration Status: mint-tsdocs → @open-docs/mintlify

## Completed Phases

### ✅ Phase 1: OpenDocs Extractor Enhancements
**Commits**: 1
- Added release tag extraction (@alpha, @beta, @public, @internal)
- Built inheritance graph extraction (extends/implements)
- Created TypeAnalyzer for rich type information
- Enabled .d.ts file processing

### ✅ Phase 2: Adapter Layer
**Commits**: 3
- Created OpenDocsResolutionCache (LRU cache for reference resolution)
- Created InheritanceResolver (resolves @inheritDoc references)
- Created OpenDocsAdapter (DocItem → ITemplateData conversion)

### ✅ Phase 3.1: Service Layer - OpenDocsExtractorService
**Commits**: 1
- Created wrapper for running OpenDocs extractor
- Provides `run()`, `load()`, and `exists()` methods

### ✅ Phase 3.2: Update GenerateAction
**Commits**: 1
- Removed api-extractor.json and tsdoc.json generation
- Replaced _runApiExtractor() with _runOpenDocsExtractor()
- Replaced buildApiModel() with OpenDocsExtractorService.load()
- Updated MarkdownDocumenter instantiation interface

## In Progress

### 🔄 Phase 3.3: Update MarkdownDocumenter

**Status**: Analysis complete, implementation needed

**Required Changes**:

1. **Interface & Constructor** (lines 75-248):
   ```typescript
   // OLD:
   export interface IMarkdownDocumenterOptions {
     apiModel: ApiModel;
     // ...
   }

   // NEW:
   export interface IMarkdownDocumenterOptions {
     docSet: DocSet;
     // ...
   }
   ```

2. **Class Properties** (lines 148-161):
   ```typescript
   // OLD:
   private readonly _apiModel: ApiModel;
   private readonly _templateDataConverter: TemplateDataConverter;

   // NEW:
   private readonly _docSet: DocSet;
   private readonly _adapter: OpenDocsAdapter;
   ```

3. **Initialization** (lines 193-248):
   - Replace `LinkValidator` initialization (uses ApiModel)
   - Replace `TemplateDataConverter` with `OpenDocsAdapter`
   - Update `LiquidTemplateManager` to not need ApiModel
   - Update `CustomMarkdownEmitter` to not need ApiModel

4. **Main Generation Loop** (line 278):
   ```typescript
   // OLD:
   await this._writeApiItemPageTemplate(this._apiModel);

   // NEW:
   for (const project of this._docSet.projects) {
     for (const item of project.items || []) {
       await this._writeDocItemPageTemplate(item);
     }
   }
   ```

5. **_writeApiItemPageTemplate → _writeDocItemPageTemplate** (lines 311-430):
   ```typescript
   // OLD:
   private async _writeApiItemPageTemplate(apiItem: ApiItem, parentApiItem?: ApiItem): Promise<void>

   // NEW:
   private async _writeDocItemPageTemplate(docItem: DocItem, parentItem?: DocItem): Promise<void>
   ```

   Changes needed:
   - Replace `ApiItemKind` checks with DocItem `kind` checks
   - Use `OpenDocsAdapter.convertToTemplateData()` instead of `TemplateDataConverter.convertApiItem()`
   - Update breadcrumb building for DocItems
   - Update navigation info building

6. **Helper Methods** - Need updates throughout:
   - `_getFilenameForApiItem()` → use DocItem
   - `_getIconForApiItem()` → use DocItem kind
   - `_getDescription()` → use DocItem.docBlock
   - `_buildBreadcrumb()` → traverse DocItem.parentId
   - `_isTopLevelItem()` → check DocItem.parentId
   - All methods using api-extractor types

**Complexity**: HIGH
- File size: ~2000 lines
- Heavy api-extractor coupling throughout
- Many helper methods need updating
- Complex template system integration

**Recommendation**:
- This should be done carefully in multiple smaller commits
- Consider creating a parallel implementation first
- Extensive testing required

## Pending Phases

### ⏳ Phase 4.1: Update LintAction
**Estimated effort**: Medium
- Replace ApiModel loading with DocSet
- Update traversal logic for DocItems
- Check docBlock.content presence
- Validate JSDoc tags

### ⏳ Phase 4.2: Update CoverageAction
**Estimated effort**: Medium
- Replace ApiModel with DocSet
- Recursive DocItem traversal
- Count documented items
- Calculate percentage

### ⏳ Phase 5: Testing & Validation
**Estimated effort**: High
- Unit tests for adapter layer
- Integration tests for full pipeline
- Template compatibility testing
- Performance testing

## Dependencies to Remove

Once migration is complete, these can be removed:
- `@microsoft/api-extractor`
- `@microsoft/api-extractor-model`
- All api-extractor config generation code
- TSDoc configuration files

## Notes

- **Commit frequency**: Following user's instruction to "commit frequently"
- **Current progress**: ~70% complete
- **Blockers**: MarkdownDocumenter is the largest remaining piece
- **Risk**: Template compatibility must be maintained exactly
