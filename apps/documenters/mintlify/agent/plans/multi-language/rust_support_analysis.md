# Rust Support Analysis for mint-tsdocs

This document analyzes how to map Rust language constructs to the unified API model, identifying which constructs map to existing `ApiItemKind` values and which require new kinds or metadata extensions.

## Executive Summary

Rust presents unique challenges due to its ownership system, trait-based polymorphism, and zero-cost abstractions. Key differences from TypeScript include:

- **Ownership and Borrowing**: Unique concepts not found in other languages
- **Traits**: Similar to interfaces but with different semantics and capabilities
- **Impl Blocks**: Separate from type definitions, enabling extension methods
- **Generics**: Monomorphization-based with trait bounds
- **Lifetimes**: Compile-time memory safety annotations
- **Macros**: Code generation at compile time
- **Modules**: File-based organization with visibility controls
- **Crates and Packages**: Unique dependency and packaging system

## Mapping Analysis

### 1. Direct Mappings to Existing ApiItemKind

These Rust constructs map cleanly to existing `ApiItemKind` values:

| Rust Construct | ApiItemKind | Notes |
|---------------|-------------|--------|
| Struct | `Class` | Data structures with fields |
| Enum | `Enum` | Algebraic data types |
| Function | `Function` | Free functions and methods |
| Constant | `Variable` | Compile-time constants |
| Module | `Namespace` | Code organization |
| Package | `Package` | Crate-level organization |

### 2. Rust-Specific ApiItemKind Extensions

These constructs require new `ApiItemKind` values:

#### `RustTrait`
- **Rationale**: Traits are Rust's primary abstraction mechanism, different from interfaces
- **Use Cases**: Shared behavior, trait bounds, polymorphism
- **Metadata**: Associated types, constants, default implementations, supertraits

#### `RustImpl`
- **Rationale**: Implementation blocks are separate from type definitions
- **Use Cases**: Method implementations, trait implementations, inherent implementations
- **Metadata**: Implemented trait, implementing type, implementation kind

#### `RustMacro`
- **Rationale**: Macros are compile-time code generation constructs
- **Use Cases**: Code generation, DSL creation, metaprogramming
- **Metadata**: Macro type (declarative/procedural), input/output patterns

#### `RustType`
- **Rationale**: Type aliases can include generic parameters and constraints
- **Use Cases**: Type abbreviations, generic type aliases
- **Metadata**: Aliased type, generic parameters

#### `RustUnion`
- **Rationale**: Untagged unions for FFI and low-level programming
- **Use Cases**: C interoperability, memory-efficient representations
- **Metadata**: Union fields, discriminant information

### 3. Metadata Extensions

#### `IRustMetadata`

```typescript
interface IRustMetadata {
    /**
     * The full crate path and version
     * Example: "serde@1.0.130"
     */
    crateInfo?: {
        name: string;
        version: string;
        features?: string[];
    };

    /**
     * Visibility modifiers
     */
    visibility?: 'public' | 'private' | 'restricted' | 'crate';

    /**
     * Ownership and borrowing information
     */
    ownership?: {
        isOwned?: boolean;
        isBorrowed?: boolean;
        isMutable?: boolean;
        lifetime?: string;
    };

    /**
     * Generic type parameters and constraints
     */
    generics?: Array<{
        name: string;
        bounds?: string[];
        defaultType?: string;
        isConst?: boolean;
    }>;

    /**
     * Lifetime parameters
     */
    lifetimes?: Array<{
        name: string;
        bounds?: string[];
    }>;

    /**
     * Trait-specific metadata
     */
    traitMetadata?: {
        associatedTypes?: Array<{ name: string; bounds?: string[] }>;
        associatedConstants?: Array<{ name: string; type: string; value?: string }>;
        supertraits?: string[];
        isUnsafe?: boolean;
        isAuto?: boolean;
    };

    /**
     * Implementation-specific metadata
     */
    implMetadata?: {
        implementedTrait?: string;
        implementingType: string;
        implType: 'inherent' | 'trait' | 'blanket';
        isUnsafe?: boolean;
        isDefault?: boolean;
    };

    /**
     * Attribute metadata (similar to C# attributes)
     */
    attributes?: Array<{
        name: string;
        arguments?: string[];
        isDerive?: boolean;
        isAttributeMacro?: boolean;
    }>;

    /**
     * Documentation comments and examples
     */
    rustdoc?: {
        summary?: string;
        examples?: string[];
        panics?: string[];
        errors?: string[];
        safety?: string;
    };

    /**
     * Unsafe code markers
     */
    unsafe?: {
        isUnsafe?: boolean;
        requiresUnsafe?: boolean;
        safetyComments?: string[];
    };

    /**
     * Const evaluation information
     */
    constEvaluation?: {
        isConst?: boolean;
        isConstFn?: boolean;
        constInputs?: string[];
    };

    /**
     * Pattern matching information
     */
    patternMatching?: {
        isExhaustive?: boolean;
        patterns?: string[];
    };
}
```

## Language-Specific Considerations

### 1. Ownership and Borrowing
Rust's ownership system is fundamental but complex to document:
- **Self parameters**: `self`, `&self`, `&mut self` indicate ownership
- **Parameter types**: `T`, `&T`, `&mut T` show borrowing patterns
- **Return types**: Ownership transfer vs. borrowing

### 2. Lifetimes
Compile-time memory safety annotations:
- **Lifetime parameters**: `'a`, `'static` in generics
- **Lifetime bounds**: `T: 'a` ensuring type outlives lifetime
- **Elided lifetimes**: Often omitted but important for understanding

### 3. Traits and Generics
- **Trait bounds**: `T: Display + Clone`
- **Associated types**: `type Item` within traits
- **Default implementations**: Methods with default bodies
- **Trait objects**: `dyn Trait` for dynamic dispatch

### 4. Error Handling
- **Result types**: `Result<T, E>` for fallible operations
- **Option types**: `Option<T>` for nullable values
- **Panic safety**: Documentation of panic conditions

### 5. Unsafe Code
- **Unsafe blocks**: Code requiring special safety considerations
- **Unsafe functions**: Functions that can only be called in unsafe contexts
- **Raw pointers**: `*const T`, `*mut T` for low-level programming

### 6. Macros
- **Declarative macros**: `macro_rules!` pattern matching
- **Procedural macros**: Custom derive and attribute macros
- **Macro hygiene**: Scoping and name resolution rules

## Recommended Tooling

### 1. rustdoc-based Extractor
**Recommended Approach**: Leverage Rust's built-in documentation tool

**Tools**:
- **rustdoc**: Rust's documentation generator
- **cargo doc**: Cargo integration for rustdoc
- **rustdoc-json**: JSON output backend for rustdoc

**Advantages**:
- Official Rust tooling with guaranteed accuracy
- Already handles complex Rust-specific features
- Integrates with existing documentation workflows
- Supports custom attributes and documentation tests

**Implementation Strategy**:
```rust
// Use rustdoc's JSON output
// rustdoc +nightly -Z unstable-options --output-format json src/lib.rs

// Parse the JSON output and convert to unified format
let rustdoc_json = std::fs::read_to_string("doc/output.json")?;
let rustdoc_data: RustdocJson = serde_json::from_str(&rustdoc_json)?;

// Convert to unified model
let unified = convert_to_unified_model(rustdoc_data);
```

### 2. syn-based Extractor
**Alternative Approach**: Use the syn crate for AST parsing

**Tools**:
- **syn**: Rust syntax parsing
- **quote**: Code generation utilities
- **proc-macro2**: Token manipulation

**Advantages**:
- Fine-grained control over parsing
- Can handle custom syntax extensions
- Works with source code directly

**Disadvantages**:
- Requires more manual implementation
- Limited semantic analysis capabilities
- No built-in documentation extraction

### 3. Compiler Plugin Approach
**Advanced Approach**: Create a Rust compiler plugin

**Tools**:
- **rustc_private**: Internal compiler APIs
- **rustc_driver**: Custom compiler drivers

**Advantages**:
- Complete access to compiler internals
- Most accurate semantic analysis
- Can integrate with build process

**Disadvantages**:
- Unstable APIs (breaks with compiler updates)
- Complex implementation
- Requires nightly Rust

## Example API JSON Output

### Struct with Generics and Lifetimes
```json
{
  "kind": "Class",
  "name": "Vec",
  "canonicalReference": "std::vec::Vec",
  "language": "rust",
  "excerptTokens": [...],
  "metadata": {
    "rust": {
      "crateInfo": {
        "name": "std",
        "version": "1.65.0"
      },
      "visibility": "public",
      "generics": [
        {
          "name": "T",
          "bounds": []
        }
      ],
      "attributes": [
        {
          "name": "derive",
          "arguments": ["Debug", "Clone"],
          "isDerive": true
        }
      ],
      "rustdoc": {
        "summary": "A contiguous growable array type with heap-allocated contents."
      }
    }
  }
}
```

### Trait Definition
```json
{
  "kind": "RustTrait",
  "name": "Display",
  "canonicalReference": "std::fmt::Display",
  "language": "rust",
  "excerptTokens": [...],
  "metadata": {
    "rust": {
      "traitMetadata": {
        "associatedTypes": [],
        "associatedConstants": [],
        "supertraits": [],
        "isUnsafe": false,
        "isAuto": false
      },
      "rustdoc": {
        "summary": "Formatting trait for an empty set of arguments."
      }
    }
  }
}
```

### Method with Lifetimes
```json
{
  "kind": "Method",
  "name": "push",
  "canonicalReference": "std::vec::Vec::push",
  "language": "rust",
  "excerptTokens": [...],
  "metadata": {
    "rust": {
      "ownership": {
        "isOwned": false,
        "isBorrowed": true,
        "isMutable": true,
        "lifetime": "'a"
      },
      "unsafe": {
        "isUnsafe": false,
        "requiresUnsafe": false
      },
      "rustdoc": {
        "summary": "Appends an element to the back of a collection.",
        "panics": ["Panics if the number of elements in the vector overflows a usize."]
      }
    }
  }
}
```

## Implementation Priority

1. **Phase 1**: Basic struct/enum/function support with direct mappings
2. **Phase 2**: Traits and implementations (core Rust concepts)
3. **Phase 3**: Generics, lifetimes, and ownership information
4. **Phase 4**: Macros, attributes, and advanced features
5. **Phase 5**: Unsafe code and advanced patterns

## Testing Strategy

Test against well-documented Rust libraries:
- **Standard Library**: Comprehensive coverage of language features
- **serde**: Serialization with complex generics and traits
- **tokio**: Async runtime with complex trait hierarchies
- **clap**: Command-line parsing with macros and attributes

## Documentation Challenges

### 1. Lifetime Visualization
- Need clear way to show lifetime relationships
- Elided lifetimes should be documented
- Lifetime bounds on generics require special attention

### 2. Trait Bound Complexity
- Multiple trait bounds can be complex: `T: Display + Clone + Send + Sync`
- Higher-ranked trait bounds (HRTB) are especially complex
- Associated type equality constraints

### 3. Macro Documentation
- Macros generate code at compile time
- Documentation should show both macro definition and generated examples
- Procedural macros require special handling

### 4. Unsafe Code Boundaries
- Clear demarcation of unsafe functions and blocks
- Safety requirements and contracts
- Interaction with safe APIs