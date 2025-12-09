# Abstract Model Proposal

## Problem Statement

The current 58-concept universal model creates unnecessary complexity for a tool that:
- Processes single-language APIs per project
- Uses language-specific templates
- Has no cross-language validation needs

## Proposed Solution: The "DocItem" Model

### Core Philosophy

**Everything is a DocItem.** Simple, powerful, extensible.

```typescript
interface DocItem {
  /** Unique identifier for this item */
  id: string;

  /** Human-readable name */
  name: string;

  /** Language-specific item type ("class", "rust-trait", "go-receiver-method") */
  kind: string;

  /** Source language */
  language: string;

  /** Documentation content */
  docBlock?: DocBlock;

  /** Container relationship */
  container?: ContainerRef;

  /** Language-specific metadata (includes signature info) */
  metadata?: Record<string, any>;

  /** Child items */
  items?: DocItem[];
}
```

### Naming Choice: "DocItem" not "Item"

**Why "DocItem":**
- ✅ **Clear purpose** - "Documentation Item" indicates it's for docs
- ✅ **Familiar** - "API item" is standard terminology
- ✅ **Unambiguous** - "DocItem" is specific to documentation context
- ✅ **Scalable** - "Item" works for files, classes, methods, properties
- ✅ **Template-friendly** - `{{ docItem.name }}` reads naturally

### File-Level Metadata

```typescript
interface FileMetadata {
  /** Programming language */
  language: string;

  /** Language version */
  languageVersion?: string;

  /** Expected item kinds in this file */
  itemKinds: string[];

  /** Documentation format used */
  docFormat: "tsdoc" | "javadoc" | "xmldoc" | "rustdoc" | "godoc" | "docstring" | "custom";

  /** Supported doc comment tags */
  supportedTags: string[];

  /** Package/module information */
  package?: {
    name: string;
    version?: string;
    path?: string;
  };

  /** Language-specific metadata */
  metadata?: Record<string, any>;
}
```

### Documentation Mapping

```typescript
interface DocBlock {
  /** Main description (TSDoc description, Javadoc main text, XML summary) */
  description?: string;

  /** Documentation tags (@param, @returns, @throws, @example, etc.) */
  tags?: Record<string, (string | DocTag)[]>;

  /** Deprecated status and message */
  deprecated?: {
    message: string;
    since?: string;
  };
}

interface DocTag {
  /** Tag name without @ */
  name: string;

  /** Tag content */
  content: string;

  /** Tag parameters for complex tags (name, type, etc.) */
  parameters?: Record<string, string>;
}
```

### Tag Usage Examples

DocBlock supports both simple string tags and complex DocTag objects:

**Simple tags (single value):**
```typescript
tags: {
  "since": ["1.0.0"],
  "author": ["John Doe"],
  "deprecated": ["Use newMethod() instead"]
}
```

**Complex tags (with parameters):**
```typescript
tags: {
  "param": [
    {
      name: "param",
      content: "The width of the rectangle",
      parameters: { name: "width", type: "number", optional: "false" }
    }
  ],
  "returns": [
    {
      name: "returns",
      content: "The calculated area",
      parameters: { type: "number" }
    }
  ]
}
```

**Why this works for all tag types:**
- **Simple tags** (@since, @author): String arrays - no parameters needed
- **Complex tags** (@param, @throws): DocTag objects - parameters for name/type info
- **Content tags** (@example, @remarks): DocTag objects - content field holds the body
- **Inline tags** ({@link}, {@code}): DocTag objects - content field holds the inline text

The optional `parameters` field in DocTag handles all complexity variations across documentation formats.
## Doc Format Mappings

### TSDoc → DocBlock
```typescript
// /**
//  * Calculates the area
//  * @param width - The width
//  * @param height - The height
//  * @returns The calculated area
//  * @throws {Error} If dimensions are negative
//  * @example
//  * area(10, 20) // returns 200
//  */
{
  description: "Calculates the area",
  tags: {
    "param": [
      {
        name: "param",
        content: "The width",
        parameters: { name: "width" }
      },
      {
        name: "param",
        content: "The height",
        parameters: { name: "height" }
      }
    ],
    "returns": ["The calculated area"],
    "throws": [
      {
        name: "throws",
        content: "If dimensions are negative",
        parameters: { type: "Error" }
      }
    ],
    "example": ["area(10, 20) // returns 200"]
  }
}
```

### Javadoc → DocBlock
```typescript
// /**
//  * Calculates the area.
//  *
//  * @param width the width
//  * @param height the height
//  * @return the calculated area
//  * @throws IllegalArgumentException if dimensions are negative
//  * @since 1.0
//  */
{
  description: "Calculates the area.",
  tags: {
    "param": [
      {
        name: "param",
        content: "the width",
        parameters: { name: "width" }
      },
      {
        name: "param",
        content: "the height",
        parameters: { name: "height" }
      }
    ],
    "returns": ["the calculated area"],
    "throws": [
      {
        name: "throws",
        content: "if dimensions are negative",
        parameters: { type: "IllegalArgumentException" }
      }
    ],
    "since": ["1.0"]
  }
}
```

### XML Documentation → DocBlock
```xml
<!-- C# XML Documentation -->
<!-- <summary>Calculates the area.</summary>
     <param name="width">The width</param>
     <param name="height">The height</param>
     <returns>The calculated area</returns>
     <exception cref="ArgumentException">If dimensions are negative</exception>
     <example>
       <code>area(10, 20)</code>
     </example> -->
```
```typescript
{
  description: "Calculates the area.",
  tags: {
    "param": [
      {
        name: "param",
        content: "The width",
        parameters: { name: "width" }
      },
      {
        name: "param",
        content: "The height",
        parameters: { name: "height" }
      }
    ],
    "returns": ["The calculated area"],
    "throws": [
      {
        name: "throws",
        content: "If dimensions are negative",
        parameters: { type: "ArgumentException" }
      }
    ],
    "example": ["area(10, 20)"]
  }
}
```

### Why This Tag Design Works

The single `DocTag` interface with optional `parameters` elegantly handles all documentation patterns:

1. **Simple metadata** - `@since 1.0.0` → `"since": ["1.0.0"]` (string array)
2. **Complex parameters** - `@param width The width` → `"param": [{ name: "param", content: "The width", parameters: { name: "width" } }]`
3. **Rich content** - `@example code block` → `"example": [{ name: "example", content: "code block" }]`
4. **Inline tags** - `{@link Foo}` → `"link": [{ name: "link", content: "Foo" }]`

No need for separate tag categories - the optional `parameters` field provides all the flexibility needed while keeping the simple cases simple.

## Benefits

### 1. Simplicity
- **One mental model** - everything is a DocItem
- **No concept debates** - "Should HaskellTypeClass be universal?" → "It's just an item with kind: 'haskell-type-class'"
- **Faster onboarding** - 5 fields to understand vs 58 concepts

### 2. Language Freedom
- **Extractors** - complete freedom to be language-idiomatic
- **No model updates** - add Zig tomorrow without touching core code
- **Natural exceptions** - Rust's "associated types"? Just `metadata.associatedTypes`

### 3. Template Power
- **Access anything** - `{{ item.metadata.associatedTypes }}`
- **No type constraints** - templates already know their language's structure
- **Evolution-friendly** - new Rust features? Update template, not model

### 4. Documentation Mapping
- **Universal structure** - `description`, `parameters`, `returns`, `throws`
- **Format-agnostic** - TSDoc, Javadoc, XMLDoc all map to same structure
- **Extensible** - custom tags for format-specific needs

## Migration Path

### Phase 1: Dual Support
1. Keep existing universal model
2. Add DocItem model alongside
3. Update one extractor to use DocItems
4. Update one template set to use DocItems

### Phase 2: Validation
1. Compare output quality
2. Measure developer experience
3. Gather feedback

### Phase 3: Decision
1. Choose preferred model
2. Migrate remaining languages
3. Deprecate unused model

## Example Usage

### Rust Extractor Output
```json
{
  "metadata": {
    "language": "rust",
    "languageVersion": "1.70.0",
    "itemKinds": ["struct", "trait", "impl", "function"],
    "docFormat": "rustdoc",
    "supportedTags": ["param", "return", "example", "panics"],
    "package": { "name": "serde", "version": "1.0.130" }
  },
  "items": [
    {
      "id": "serde::de::Deserialize",
      "name": "Deserialize",
      "kind": "rust-trait",
      "language": "rust",
      "docBlock": {
        "description": "A data structure that can be deserialized from any data format supported by Serde."
      },
      "metadata": {
        "isPublic": true,
        "crate": "serde",
        "module": "de",
        "associatedTypes": ["Item"],
        "supertraits": ["Sized"],
        "signature": {
          "typeParameters": [{"name": "T"}],
          "bounds": ["Self: Sized"]
        }
      },
      "items": [
        {
          "id": "serde::de::Deserialize::deserialize",
          "name": "deserialize",
          "kind": "rust-trait-method",
          "language": "rust",
          "metadata": {
            "signature": {
              "parameters": [
                {"name": "deserializer", "type": "D"}
              ],
              "returnType": "Result<Self, D::Error>"
            }
          },
          "docBlock": {
            "description": "Deserialize this value from the given Serde deserializer.",
            "tags": {
              "param": [
                {
                  name: "param",
                  content: "The Serde deserializer",
                  parameters: { name: "deserializer" }
                }
              ],
              "returns": ["`Ok(value)` if deserialization is successful, `Err(error)` otherwise"],
              "throws": [
                {
                  name: "throws",
                  content: "When the deserializer encounters an error",
                  parameters: { type: "D::Error" }
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

### Template Usage
```liquid
{% for docItem in items %}
  {% if docItem.kind == 'rust-trait' %}
    ## {{ docItem.name }}

    {{ docItem.docBlock.description }}

    {% if docItem.metadata.associatedTypes %}
    ### Associated Types
    {% for type in docItem.metadata.associatedTypes %}
    - {{ type }}
    {% endfor %}
    {% endif %}
  {% endif %}
{% endfor %}
```

## File Organization Strategy

### Handling Large Documentation Sets

The DocItem model can create extremely large JSON files (50-200MB for large codebases). We need a scalable file organization strategy:

```typescript
interface DocumentationSet {
  /** Top-level documentation organization */
  workspace: {
    id: string;
    name: string;
    description?: string;

    /** Navigation skeleton with JSON Schema $ref */
    navigation: {
      root: DocItem;
      projects: Array<{
        id: string;
        name: string;
        _ref: string;  // JSON Schema $ref
      }>;
    };

    /** File organization strategy */
    organization: {
      format: "monolithic" | "chunked" | "streaming";
      chunkSize?: number;
      maxFileSize?: string;
    };
  };

  /** Individual documentation projects */
  projects: Map<string, Project>;
}

interface Project {
  id: string;
  name: string;
  language: string;

  /** File location for large collections */
  items?: {
    format: "jsonl" | "json";
    file: string;
    count: number;
  };

  /** Cross-references use JSON Schema $ref */
  metadata?: {
    [key: string]: any;
    dependencies?: Array<{
      project: string;
      ref: string;  // JSON Schema $ref to other project
    }>;
  };
}
```

### Hybrid File Strategy

**For small projects (< 5MB):**
- Single monolithic JSON file
- Full structure always loaded

**For medium projects (5-50MB):**
- Navigation skeleton + chunked components
- JSON Schema $ref for cross-references

**For large projects (> 50MB):**
- Navigation skeleton in memory
- Components as JSONL streams
- Selective loading based on template needs

### Benefits

1. **Memory efficient**: 8-16MB vs 120-400MB for monolithic approach
2. **Template compatible**: Navigation structure always available
3. **Streaming ready**: Process large collections line-by-line
4. **Standard compliant**: Uses JSON Schema $ref where appropriate

## Language-Agnostic Naming

Avoiding Node.js/package-centric terminology:

### Recommended Terms

**Workspace → Project** (Developer-Friendly)
- **Workspace**: The entire documentation set (entire repository or collection)
- **Project**: Individual documentable units (Rust crate, Go module, Python package, etc.)
- Works across all programming languages and project structures
- Familiar to developers without being language-specific

**Alternative schemes:**
- **System → Component**: For architectural precision
- **Catalog → Artifact**: For API-heavy, reference documentation
- **Registry → Service**: For microservices and API ecosystems

### Example Usage

```typescript
// Workspace-level configuration
{
  "workspace": {
    "id": "my-company-apis",
    "name": "My Company APIs",
    "projects": [
      { "id": "auth-service", "language": "go" },
      { "id": "data-models", "language": "rust" },
      { "id": "web-sdk", "language": "typescript" }
    ]
  }
}

// Project-level documentation
{
  "project": {
    "id": "auth-service",
    "name": "Authentication Service",
    "language": "go",
    "items": {
      "format": "jsonl",
      "file": "projects/auth-service.jsonl"
    }
  }
}
```

## Next Steps

1. **Validate approach** with team/stakeholders
2. **Define JSON Schema** for DocItem structure
3. **Prototype file splitting** with hybrid JSON Schema $ref + JSONL
4. **Test naming scheme** across different language ecosystems
5. **Prototype one extractor** (Rust or Go) using DocItems
6. **Create template examples** showing DocItem usage
7. **Measure developer experience** vs universal model

This approach eliminates concept complexity while providing scalable file organization and language-neutral terminology. The DocItem model embraces the reality that documentation tools process diverse codebases and focuses on what matters: clean, extensible data flow from extractors to templates."}