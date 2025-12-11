# C# Support Analysis for mint-tsdocs

This document analyzes how to map C# language constructs to the unified API model, identifying which constructs map to existing `ApiItemKind` values and which require new kinds or metadata extensions.

## Executive Summary

C# has strong similarities to TypeScript due to their shared object-oriented heritage, but includes several unique constructs that require special handling:

- **Namespaces**: Similar to TypeScript namespaces but with different scoping rules
- **Properties**: First-class language constructs with getters/setters
- **Indexers**: Special properties for array-like access
- **Events**: First-class language constructs with add/remove accessors
- **Attributes**: Metadata annotations similar to Java annotations
- **Delegates**: Type-safe function pointers
- **Structs**: Value types distinct from classes
- **Interfaces**: Can include default implementations (C# 8.0+)
- **Records**: Immutable reference types with value equality
- **Generics**: More powerful than TypeScript with constraints and variance

## Mapping Analysis

### 1. Direct Mappings to Existing ApiItemKind

These C# constructs map cleanly to existing `ApiItemKind` values:

| C# Construct | ApiItemKind | Notes |
|--------------|-------------|--------|
| Class | `Class` | Standard OOP class |
| Interface | `Interface` | Can include default implementations |
| Enum | `Enum` | Value-based enumeration |
| Method | `Method` | Instance and static methods |
| Function | `Function` | Static methods at namespace level |
| Variable | `Variable` | Static fields and constants |
| Namespace | `Namespace` | Package-like organization |
| Package | `Package` | Assembly-level organization |

### 2. C#-Specific ApiItemKind Extensions

These constructs require new `ApiItemKind` values:

#### `CSharpProperty`
- **Rationale**: Properties are first-class constructs with getters/setters, not just fields
- **Use Cases**: Auto-properties, computed properties, property accessors
- **Metadata**: Accessors (get/set), backing field info, auto-property indicator

#### `CSharpIndexer`
- **Rationale**: Special syntax for array-like access (`this[int index]`)
- **Use Cases**: Collection classes, dictionary-like access
- **Metadata**: Parameter types, return type, accessor information

#### `CSharpEvent`
- **Rationale**: Events are first-class constructs with add/remove accessors
- **Use Cases**: Publisher-subscriber patterns, UI event handling
- **Metadata**: Event handler type, add/remove accessors

#### `CSharpDelegate`
- **Rationale**: Type-safe function pointers with specific signature
- **Use Cases**: Callbacks, event handlers, functional programming
- **Metadata**: Return type, parameter types, variance annotations

#### `CSharpAttribute`
- **Rationale**: Metadata annotations that can be applied to various constructs
- **Use Cases**: Serialization, validation, framework integration
- **Metadata**: Constructor arguments, named parameters, target elements

#### `CSharpRecord`
- **Rationale**: Immutable reference types with value equality (C# 9.0+)
- **Use Cases**: Data transfer objects, value objects
- **Metadata**: Positional parameters, init-only properties

#### `CSharpStruct`
- **Rationale**: Value types with different semantics from classes
- **Use Cases**: Lightweight data structures, performance-critical code
- **Metadata**: Layout information, readonly modifiers

### 3. Metadata Extensions

#### `ICSharpMetadata`

```typescript
interface ICSharpMetadata {
    /**
     * The fully qualified type name including namespace
     * Example: "System.Collections.Generic.List`1"
     */
    fullyQualifiedName?: string;

    /**
     * Assembly information
     */
    assembly?: {
        name: string;
        version: string;
        culture?: string;
        publicKeyToken?: string;
    };

    /**
     * Generic type parameters and constraints
     */
    generics?: Array<{
        name: string;
        constraints?: string[];
        variance?: 'in' | 'out' | 'none';
    }>;

    /**
     * Access modifiers
     */
    accessModifier?: 'public' | 'private' | 'protected' | 'internal' | 'protected internal' | 'private protected';

    /**
     * Type modifiers
     */
    modifiers?: {
        isStatic?: boolean;
        isAbstract?: boolean;
        isSealed?: boolean;
        isVirtual?: boolean;
        isOverride?: boolean;
        isReadOnly?: boolean;
        isConst?: boolean;
        isUnsafe?: boolean;
        isAsync?: boolean;
        isPartial?: boolean;
    };

    /**
     * XML documentation comments
     */
    xmlDocumentation?: {
        summary?: string;
        remarks?: string;
        example?: string;
        param?: Array<{ name: string; text: string }>;
        returns?: string;
        exception?: Array<{ type: string; text: string }>;
    };

    /**
     * Attributes applied to this item
     */
    attributes?: Array<{
        type: string;
        constructorArguments?: any[];
        namedParameters?: Record<string, any>;
    }>;

    /**
     * Property-specific metadata
     */
    propertyMetadata?: {
        hasGetter?: boolean;
        hasSetter?: boolean;
        isAutoProperty?: boolean;
        backingFieldName?: string;
    };

    /**
     * Indexer-specific metadata
     */
    indexerMetadata?: {
        parameters: Array<{ name: string; type: string; isOptional?: boolean }>;
        returnType: string;
    };

    /**
     * Event-specific metadata
     */
    eventMetadata?: {
        eventHandlerType: string;
        hasAddAccessor?: boolean;
        hasRemoveAccessor?: boolean;
    };

    /**
     * Delegate-specific metadata
     */
    delegateMetadata?: {
        returnType: string;
        parameters: Array<{ name: string; type: string; isOptional?: boolean; isParams?: boolean }>;
    };
}
```

## Recommended Tooling

### 1. Roslyn-based Extractor
**Recommended Approach**: Use Microsoft's Roslyn compiler platform

**Tools**:
- **Microsoft.CodeAnalysis**: Core Roslyn APIs
- **Microsoft.CodeAnalysis.CSharp**: C#-specific analysis
- **Microsoft.CodeAnalysis.Workspaces**: Project/solution loading

**Advantages**:
- Official Microsoft tooling with guaranteed accuracy
- Complete access to semantic model (not just syntax)
- Handles complex scenarios like partial classes, generics, extension methods
- Can resolve XML documentation comments

**Implementation Strategy**:
```csharp
// Load solution/project
var workspace = MSBuildWorkspace.Create();
var solution = await workspace.OpenSolutionAsync(solutionPath);

// Analyze each project
foreach (var project in solution.Projects)
{
    var compilation = await project.GetCompilationAsync();

    // Visit all symbols in the compilation
    var visitor = new ApiExtractorVisitor(compilation);
    visitor.Visit(compilation.GlobalNamespace);
}
```

### 2. Alternative: Reflection-based Extractor
**Fallback Approach**: Use .NET reflection on compiled assemblies

**Tools**:
- **Mono.Cecil**: Assembly inspection without loading
- **System.Reflection**: Runtime reflection (requires loading)

**Advantages**:
- Works with compiled assemblies (no source required)
- Simpler implementation
- Handles obfuscated code better

**Disadvantages**:
- No access to XML documentation comments
- Limited source location information
- Cannot handle conditional compilation

## Language-Specific Considerations

### 1. Generic Types
C# generics are more powerful than TypeScript generics:
- **Constraints**: `where T : class, IDisposable`
- **Variance**: `interface IEnumerable<out T>` (covariant)
- **Multiple type parameters**: `class Dictionary<TKey, TValue>`

### 2. Extension Methods
Static methods that appear as instance methods:
- Must be extracted as `Method` items
- Metadata should indicate they're extension methods
- Include the `this` parameter in the first position

### 3. Async/Await
- Methods returning `Task` or `Task<T>` should be marked as async
- State machine implementation details should be hidden
- Focus on the public API surface

### 4. Nullable Reference Types
- Include nullable annotations (`?`) in type information
- Respect `#nullable enable` context
- Handle nullable context in metadata

### 5. Pattern Matching
- Extract pattern matching methods (`Deconstruct`)
- Include pattern types in method signatures
- Handle switch expressions appropriately

## Example API JSON Output

```json
{
  "kind": "CSharpProperty",
  "name": "Count",
  "canonicalReference": "System.Collections.Generic.List`1!Count#",
  "language": "csharp",
  "excerptTokens": [...],
  "metadata": {
    "csharp": {
      "fullyQualifiedName": "System.Collections.Generic.List`1.Count",
      "accessModifier": "public",
      "modifiers": {
        "isReadOnly": true
      },
      "propertyMetadata": {
        "hasGetter": true,
        "hasSetter": false,
        "isAutoProperty": false
      },
      "xmlDocumentation": {
        "summary": "Gets the number of elements contained in the List."
      }
    }
  }
}
```

## Implementation Priority

1. **Phase 1**: Basic class/interface/enum support with direct mappings
2. **Phase 2**: Properties, indexers, and events (most common unique constructs)
3. **Phase 3**: Attributes, delegates, records, and structs
4. **Phase 4**: Advanced features (generics, extension methods, async)

## Testing Strategy

Test against well-documented C# libraries:
- **.NET Base Class Library**: Comprehensive coverage of language features
- **Newtonsoft.Json**: Popular library with complex APIs
- **Entity Framework**: Demonstrates attributes and generics
- **ASP.NET Core**: Shows modern C# patterns and async code