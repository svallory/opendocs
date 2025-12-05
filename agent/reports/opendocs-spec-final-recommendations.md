# OpenDocs Specification Format - Final Recommendations

## Executive Summary

Based on analysis of API Extractor output conversion and OpenDocs' goal to be "the OpenAPI format for libraries and CLIs," we recommend three minimal, high-value additions to the OpenDocs Specification Format.

## Concrete Conversion Examples

### Example 1: Function with Rich Documentation

**API Extractor Format:**
```json
{
  "kind": "Function",
  "canonicalReference": "mint-tsdocs!createDebugger:function(1)",
  "docComment": "/**\n * Create a namespaced debugger with level-specific methods\n *\n * @param namespace - The namespace for this debugger (e.g., 'documenter', 'templates')\n *\n * @returns Debugger instance with level methods\n *\n * @example\n * ```typescript\n * const debug = createDebugger('templates');\n * debug.info('Loading template: %s', templateName);\n * debug.error('Template not found: %s', templatePath);\n *\n * if (debug.isEnabled('trace')) {\n *   debug.trace('Template data: %O', complexObject);\n * }\n * ```\n *\n * @beta\n */",
  "releaseTag": "Beta",
  "parameters": [
    {
      "parameterName": "namespace",
      "parameterTypeTokenRange": { "startIndex": 1, "endIndex": 2 },
      "isOptional": false
    }
  ]
}
```

**OpenDocs Format:**
```json
{
  "id": "mint-tsdocs#createDebugger",
  "name": "createDebugger",
  "kind": "function",
  "language": "typescript",
  "signature": "export declare function createDebugger(namespace: string): Debugger;",
  "returnType": "Debugger",
  "parameters": [
    {
      "name": "namespace",
      "type": "string",
      "description": "The namespace for this debugger (e.g., 'documenter', 'templates')",
      "optional": false
    }
  ],
  "docBlock": {
    "description": "Create a namespaced debugger with level-specific methods",
    "tags": {
      "param": [{
        "name": "param",
        "content": "The namespace for this debugger (e.g., 'documenter', 'templates')",
        "parameters": { "name": "namespace", "type": "string" }
      }],
      "returns": [{ "name": "returns", "content": "Debugger instance with level methods" }],
      "example": [{
        "name": "example",
        "content": "```typescript\nconst debug = createDebugger('templates');\ndebug.info('Loading template: %s', templateName);\ndebug.error('Template not found: %s', templatePath);\n\nif (debug.isEnabled('trace')) {\n  debug.trace('Template data: %O', complexObject);\n}\n```",
        "parameters": { "language": "typescript" }
      }],
      "beta": [{ "name": "beta", "content": "" }]
    }
  },
  "metadata": {
    "releaseTag": "Beta",
    "canonicalReference": "mint-tsdocs!createDebugger:function(1)"
  }
}
```

### Key Observations from Conversion

1. **Documentation Richness Preserved**: The multi-line description, parameters, return documentation, and code examples are all maintained.

2. **Tag System Flexibility**: OpenDocs' tag system can represent complex documentation elements:
   - `@example` with code blocks stored as content
   - `@beta` as a simple tag flag
   - `@param` with structured parameters

3. **Type Information Maintained**: Parameter types and return types are preserved, just in a different structure.

4. **Metadata Holds Additional Info**: The `releaseTag` and `canonicalReference` are preserved in the metadata field.

## Current OpenDocs State Analysis

### What's Already There
1. **ContainerRef**: Links DocItems to parent containers via `container` property
2. **Extends/Implements**: Simple string relationships already supported
3. **Flexible Tags**: Can represent any documentation pattern
4. **Hierarchical Structure**: Items can contain child items

### What's Missing for "OpenAPI for Libraries" Goal

## Final Recommendations

### 1. Language-Native Fully Qualified Names (FQN) ⭐⭐⭐⭐⭐

Add `id` field that uses language-native FQN format:

```json
// TypeScript
{
  "id": "mint-tsdocs#createDebugger",
  "language": "typescript"
  // Natural TS format: package#export
}

// Rust
{
  "id": "serde::de::Deserialize",
  "language": "rust"
  // Natural Rust format: paths with ::
}

// Go
{
  "id": "fmt.Printf",
  "language": "go"
  // Natural Go format: package.Function
}
```

**Why it's critical:**
- Enables reliable cross-references between projects
- Powers IDE "Go to Definition" features
- Allows tooling to understand API relationships
- Uses each language's natural naming convention

### 2. Repository Information at Project Level ⭐⭐⭐⭐⭐

Add repository field to Project:

```json
{
  "id": "mint-tsdocs",
  "name": "Mint TSDocs",
  "repository": {
    "type": "git",
    "url": "https://github.com/mintlify/mint-tsdocs",
    "fileUrlTemplate": "{repo}/blob/{hash}/{path}#L{line}"
  }
}
```

### 3. Location at Item Level ⭐⭐⭐⭐

Add location to DocItems:

```json
{
  "id": "mint-tsdocs#createDebugger",
  "location": {
    "path": "src/utils/debug.ts",
    "number": 42,
    "column": 1
  }
}
```

**Why it's valuable:**
- Links documentation to source code
- Enables "View Source" buttons
- Supports automated tooling
- Essential for open source projects

### 4. Relations Model (Replaces ContainerRef) ⭐⭐⭐

Introduce a new `relations` property that centralizes all code relationships:

```json
{
  "relations": {
    "container": "mint-tsdocs#Utils",                    // String = DocItem ID
    "extends": "mint-tsdocs#BaseDebugger",              // String = DocItem ID
    "implements": ["mint-tsdocs#IDebugger"],            // Array = multiple relations
    "rust-trait-impl": {                                 // Object = full Relation
      "kind": "rust-trait-impl",
      "target": "serde::Serialize",
      "metadata": {
        "derived": true
      }
    }
  }
}
```

**Relation Model:**
```typescript
type Relation<K extends string> = {
  kind: K;
  target: string;  // DocItem ID or language-native FQN
  metadata?: Record<string, unknown>;
}

// Map type allows:
// - string value (assumes DocItem ID)
// - Relation object (for complex cases)
// - Relation[] (for multiple relations of same kind)
type Relations = Map<string, string | Relation | Relation[]>;
```

**Why Relations Model:**
- Replaces ContainerRef with more flexible system
- Centralizes all code relationships
- Language-agnostic (any relationship kind allowed)
- Supports both simple (string) and complex (Relation) cases
- Metadata can store relationship-specific details

**Migration from ContainerRef:**
```json
// Old: ContainerRef
{
  "container": {
    "id": "mint-tsdocs#Utils",
    "relationship": "module"
  }
}

// New: Relations
{
  "relations": {
    "container": "mint-tsdocs#Utils"  // Simpler!
  }
}
```

**Benefits:**
- Unified model for all relationships
- Extensible for any language-specific relationships
- Metadata provides flexibility for complex cases
- String values keep simple cases simple

## Implementation Priority

### Phase 1: Essential for Tooling (High ROI)
1. **Language-native FQN in `id`** - Enables cross-project ecosystem
2. **Project-level repository** - Enables source linking

### Phase 2: Developer Experience (Medium ROI)
3. **Item-level location** - Precise source links
4. **Relations model** - Unified relationship model

## Design Principles Maintained

1. **Keep It Universal**: Works for any programming language
2. **Make It Optional**: Doesn't break existing implementations
3. **Enable Tooling**: Focuses on machine-readable value
4. **Preserve Simplicity**: Minimal additions with maximum impact

## Conclusion

The three core additions (language-native FQN, repository info, source location) would transform OpenDocs from a documentation format into a practical "OpenAPI for libraries" - enabling rich tooling, IDE integration, and cross-language ecosystem support while maintaining its universal design principles.

The relations model provides a unified, extensible way to represent all code relationships while keeping the simple cases simple through string values.