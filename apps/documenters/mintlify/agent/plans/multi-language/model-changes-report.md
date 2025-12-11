# API Extractor Model Changes Report

This report details the extensions made to the `@microsoft/api-extractor-model` to support multiple programming languages (Go, Python, C#, Rust, Zig). The goal is to create a strict superset of the existing model, ensuring backward compatibility while accommodating the unique features of these languages.

## 1. `ApiItemKind` Extensions

The `ApiItemKind` enum has been extended to include language-specific constructs that do not map cleanly to existing TypeScript concepts.

### Go Extensions
*   **`GoStruct`**: Added to represent Go structs. While similar to `Class`, structs lack inheritance and have different semantics (embedding vs. extending).
*   **`GoInterface`**: Added to represent Go interfaces. Distinct from TS interfaces because implementation is implicit.
*   **`GoMethod`**: Added to explicitly model the receiver type, which is a core concept in Go methods.

### Python Extensions
*   **`PythonModule`**: Added to represent Python modules. Maps 1:1 with files or directories containing `__init__.py`. Distinct from `Namespace` which is more abstract in TS.
*   **`PythonClass`**: Added to represent Python classes. Can handle multiple inheritance and dynamic metaclass features.
*   **`PythonDecorator`**: Added to represent decorators as first-class items, often used as modifiers in documentation.

### C# Extensions
*   **`CSharpProperty`**: Added to represent C# properties with getters/setters, distinct from fields.
*   **`CSharpIndexer`**: Added for array-like access syntax (`this[int index]`).
*   **`CSharpEvent`**: Added for events with add/remove accessors.
*   **`CSharpDelegate`**: Added for type-safe function pointers.
*   **`CSharpAttribute`**: Added for metadata annotations applied to constructs.
*   **`CSharpRecord`**: Added for immutable reference types with value equality.
*   **`CSharpStruct`**: Added for value types with different semantics from classes.

### Rust Extensions
*   **`RustTrait`**: Added for Rust traits, different from interfaces due to associated types and default implementations.
*   **`RustImpl`**: Added for implementation blocks separate from type definitions.
*   **`RustMacro`**: Added for compile-time code generation constructs.
*   **`RustType`**: Added for type aliases that can include generic parameters.
*   **`RustUnion`**: Added for untagged unions used in FFI and low-level programming.

### Zig Extensions
*   **`ZigErrorSet`**: Added for Zig's unique error sets in error handling.
*   **`ZigComptime`**: Added for compile-time functions used in generic programming.
*   **`ZigOpaque`**: Added for abstract types used in C interoperability.

## 2. `IApiItemJson` Extensions

The base interface for all API items has been extended with the following fields:

### `language: SourceLanguage`
*   **Type**: `'typescript' | 'go' | 'python' | 'csharp' | 'rust' | 'zig'`
*   **Purpose**: Explicitly identifies the source language of the item. This allows consumers (like `mint-tsdocs`) to switch rendering logic (e.g., syntax highlighting, signature formatting) without inferring from the file extension or context.

### `metadata`
A new optional container for language-specific data that doesn't fit into the standard `ApiItem` fields.

#### `metadata.go` (`IGoMetadata`)
*   **`importPath`**: The full Go package path (e.g., `github.com/user/repo/pkg`). Essential for linking and imports.
*   **`receiver`**: For `GoMethod` items, defines the receiver's name, type, and pointer status (`*T` vs `T`).
*   **`embeddedFields`**: Lists fields embedded in a struct, preserving the "is-a" vs "has-a" distinction unique to Go embedding.

#### `metadata.python` (`IPythonMetadata`)
*   **`qualname`**: The fully qualified dotted name (e.g., `pandas.DataFrame.head`). Critical for Python's import system and cross-referencing.
*   **`decorators`**: A list of decorators applied to the item, including arguments. This allows documentation to show `@deprecated`, `@classmethod`, etc., prominently.
*   **`arguments`**: Captures Python-specific argument features like `*args`, `**kwargs`, and keyword-only arguments, which don't map to TS parameters.

#### `metadata.csharp` (`ICSharpMetadata`)
*   **`fullyQualifiedName`**: Complete type name including namespace (e.g., `System.Collections.Generic.List`1`).
*   **`assembly`**: Assembly name, version, and strong-name information.
*   **`generics`**: Generic type parameters with constraints and variance annotations.
*   **`accessModifier`**: C#-specific access levels (`public`, `private`, `protected`, `internal`, etc.).
*   **`modifiers`**: Type modifiers like `static`, `abstract`, `sealed`, `virtual`, `override`, `async`, etc.
*   **`xmlDocumentation`**: XML documentation comments including summary, remarks, parameters, returns, and exceptions.
*   **`attributes`**: Applied attributes with constructor arguments and named parameters.
*   **Language-specific metadata**: Property metadata (getters/setters), indexer parameters, event handlers, delegate signatures.

#### `metadata.rust` (`IRustMetadata`)
*   **`crateInfo`**: Crate name, version, and enabled features.
*   **`visibility`**: Rust visibility modifiers (`public`, `private`, `crate`, `restricted`).
*   **`ownership`**: Ownership and borrowing information (`self`, `&self`, `&mut self`).
*   **`generics`**: Generic type parameters with trait bounds and default types.
*   **`lifetimes`**: Lifetime parameters and bounds for memory safety.
*   **`traitMetadata`**: Associated types, constants, supertraits, and special markers.
*   **`implMetadata`**: Implementation details (inherent vs trait implementations).
*   **`attributes`**: Rust attributes including derives and attribute macros.
*   **`rustdoc`**: Documentation with examples, panic conditions, error conditions, and safety notes.
*   **`unsafe`**: Unsafe code markers and safety requirements.
*   **`constEvaluation`**: Const function and compile-time evaluation information.
*   **`patternMatching`**: Pattern exhaustiveness and match arm information.

#### `metadata.zig` (`IZigMetadata`)
*   **`packageInfo`**: Zig package name, version, and dependencies.
*   **`location`**: Source file location with line and column information.
*   **`callingConvention`**: Function calling convention (`C`, `Inline`, `Async`).
*   **`memoryManagement`**: Allocator requirements and ownership transfer semantics.
*   **`errorHandling`**: Error sets, error union types, and failure conditions.
*   **`comptime`**: Compile-time function parameters and generic constraints.
*   **`typeInfo`**: Zig-specific type information (pointers, slices, arrays, alignment).
*   **`docComments`**: Documentation with examples, safety notes, and test cases.
*   **`cInterop`**: C interoperability information (extern functions, packed structs).
*   **`buildConfig`**: Build-time configuration (target OS, architecture, build mode).

## 3. `IApiPackageJson` Extensions

### `language: SourceLanguage`
*   **Purpose**: Indicates the primary language of the package.

## Summary of Impact

*   **Backward Compatibility**: All existing `api-extractor` tools can read the new JSON format (ignoring the new fields) because the core structure (`kind`, `canonicalReference`, `members`) remains intact for standard items.
*   **Extensibility**: The `metadata` pattern allows for future language additions without polluting the root namespace of the JSON objects.
*   **Type Safety**: The new model uses a strict superset definition in TypeScript, ensuring that any valid `api-extractor-model` object is also a valid `unified-api-model` object.
*   **Language Coverage**: The model now supports six major programming languages with comprehensive coverage of their unique features and constructs.
*   **Documentation Richness**: Each language's specific documentation patterns and requirements are accommodated through dedicated metadata structures.
