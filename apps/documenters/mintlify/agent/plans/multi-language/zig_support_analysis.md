# Zig Support Analysis for mint-tsdocs

This document analyzes how to map Zig language constructs to the unified API model, identifying which constructs map to existing `ApiItemKind` values and which require new kinds or metadata extensions.

## Executive Summary

Zig is a systems programming language with unique features that distinguish it from TypeScript:

- **Comptime**: Compile-time code execution and generics
- **Error Handling**: Explicit error union types and error sets
- **Memory Management**: Manual memory management with allocators
- **Structs and Unions**: C-like but with modern features
- **No Hidden Control Flow**: No exceptions, constructors, or destructors
- **Package Management**: Simple file-based module system
- **C Interop**: First-class support for C library integration

## Mapping Analysis

### 1. Direct Mappings to Existing ApiItemKind

These Zig constructs map cleanly to existing `ApiItemKind` values:

| Zig Construct | ApiItemKind | Notes |
|---------------|-------------|--------|
| Struct | `Class` | Data structures with fields |
| Enum | `Enum` | Tagged union types |
| Union | `Interface` | Untagged unions for FFI |
| Function | `Function` | Free functions and methods |
| Variable | `Variable` | Global and local variables |
| Namespace | `Namespace` | File-based modules |
| Package | `Package` | Collection of modules |

### 2. Zig-Specific ApiItemKind Extensions

These constructs require new `ApiItemKind` values:

#### `ZigErrorSet`
- **Rationale**: Error sets are unique to Zig's error handling
- **Use Cases**: Defining possible error values for functions
- **Metadata**: Error values, documentation for each error

#### `ZigComptime`
- **Rationale**: Comptime functions execute at compile time
- **Use Cases**: Generic programming, compile-time validation
- **Metadata**: Comptime parameters, return type constraints

#### `ZigOpaque`
- **Rationale**: Opaque types for C interoperability
- **Use Cases**: Wrapping C pointers, abstract handles
- **Metadata**: Size information, alignment requirements

### 3. Metadata Extensions

#### `IZigMetadata`

```typescript
interface IZigMetadata {
    /**
     * Package information
     * Example: "std@0.11.0"
     */
    packageInfo?: {
        name: string;
        version: string;
        dependencies?: string[];
    };

    /**
     * File location information
     */
    location?: {
        file: string;
        line: number;
        column: number;
    };

    /**
     * Calling convention
     */
    callingConvention?: 'C' | 'Inline' | 'Async' | 'Unspecified';

    /**
     * Memory management information
     */
    memoryManagement?: {
        allocatorRequired?: boolean;
        returnOwnership?: 'caller' | 'callee' | 'static';
        isNoSuspend?: boolean;
    };

    /**
     * Error handling information
     */
    errorHandling?: {
        errorSet?: string;
        canFail?: boolean;
        isErrorUnion?: boolean;
        isInfallible?: boolean;
    };

    /**
     * Comptime information
     */
    comptime?: {
        isComptime?: boolean;
        comptimeParameters?: Array<{
            name: string;
            type: string;
            defaultValue?: string;
        }>;
        genericConstraints?: string[];
    };

    /**
     * Type information specific to Zig
     */
    typeInfo?: {
        isPointer?: boolean;
        isSlice?: boolean;
        isArray?: boolean;
        sentinel?: string;
        alignment?: number;
        bitWidth?: number;
    };

    /**
     * Documentation comments
     */
    docComments?: {
        summary?: string;
        examples?: string[];
        safety?: string;
        testCases?: string[];
    };

    /**
     * C interoperability information
     */
    cInterop?: {
        isExtern?: boolean;
        cName?: string;
        libraryName?: string;
        isExport?: boolean;
        isPacked?: boolean;
    };

    /**
     * Build configuration
     */
    buildConfig?: {
        targetOs?: string[];
        targetArch?: string[];
        buildMode?: 'Debug' | 'ReleaseSafe' | 'ReleaseFast' | 'ReleaseSmall';
        isTest?: boolean;
    };
}
```

## Language-Specific Considerations

### 1. Comptime System
Zig's compile-time execution is unique:
- **Comptime parameters**: `comptime T: type`
- **Generic instantiation**: Types created at compile time
- **Compile-time functions**: Execute during compilation
- **Type functions**: Return types based on parameters

### 2. Error Handling
Explicit error handling without exceptions:
- **Error sets**: `error{FileNotFound, PermissionDenied}`
- **Error unions**: `FileError!void`
- **Error propagation**: `try` and `catch` syntax
- **Error inference**: Automatic error set union

### 3. Memory Management
Manual memory management with allocators:
- **Allocator parameter**: Explicit allocator passing
- **Memory ownership**: Clear ownership semantics
- **No hidden allocations**: All allocations are explicit
- **Resource management**: Manual cleanup required

### 4. Type System
Rich type system with compile-time features:
- **Pointers**: Single-item pointers `*T`
- **Slices**: Multi-item pointers `[]T`
- **Arrays**: Fixed-size arrays `[N]T`
- **Sentinel-terminated**: Special termination values
- **Bit fields**: Precise bit-level control

### 5. C Interoperability
First-class C integration:
- **Extern functions**: C function declarations
- **Packed structs**: C-compatible struct layout
- **Opaque types**: Abstract C pointers
- **Calling conventions**: C calling convention support

## Recommended Tooling

### 1. Zig Compiler-based Extractor
**Recommended Approach**: Use Zig's built-in AST and semantic analysis

**Tools**:
- **std.zig.Ast**: Zig's AST parsing
- **std.zig.parse**: Parse Zig source code
- **std.Build**: Build system integration

**Advantages**:
- Official Zig tooling with guaranteed accuracy
- Handles comptime evaluation
- Integrates with build system
- Supports cross-compilation contexts

**Implementation Strategy**:
```zig
const std = @import("std");
const Ast = std.zig.Ast;

pub fn extractApi(file_path: []const u8) !UnifiedApiModel {
    const source = try std.fs.cwd().readFileAlloc(allocator, file_path, 10_000_000);
    defer allocator.free(source);

    var tree = try std.zig.parse(allocator, source);
    defer tree.deinit(allocator);

    const node_data = tree.nodes.items(.data);
    const node_tags = tree.nodes.items(.tag);

    // Walk AST and extract API information
    var extractor = ApiExtractor.init(allocator, tree);
    try extractor.extract();

    return extractor.toUnifiedModel();
}
```

### 2. Alternative: Custom Parser
**Fallback Approach**: Build custom parser for API extraction

**Advantages**:
- Full control over extraction logic
- Can handle custom documentation formats
- Lightweight for simple use cases

**Disadvantages**:
- Requires manual AST walking
- Limited semantic analysis
- Must handle all Zig syntax manually

## Example API JSON Output

### Function with Error Handling
```json
{
  "kind": "Function",
  "name": "readFile",
  "canonicalReference": "std.fs.readFile",
  "language": "zig",
  "excerptTokens": [...],
  "metadata": {
    "zig": {
      "packageInfo": {
        "name": "std",
        "version": "0.11.0"
      },
      "callingConvention": "C",
      "errorHandling": {
        "errorSet": "std.fs.File.OpenError",
        "canFail": true,
        "isErrorUnion": true
      },
      "memoryManagement": {
        "allocatorRequired": true,
        "returnOwnership": "caller"
      },
      "docComments": {
        "summary": "Opens a file for reading."
      }
    }
  }
}
```

### Struct Definition
```json
{
  "kind": "Class",
  "name": "ArrayList",
  "canonicalReference": "std.ArrayList",
  "language": "zig",
  "excerptTokens": [...],
  "metadata": {
    "zig": {
      "comptime": {
        "isComptime": true,
        "genericConstraints": ["T: anytype"]
      },
      "memoryManagement": {
        "allocatorRequired": true,
        "returnOwnership": "static"
      },
      "typeInfo": {
        "isPointer": false,
        "alignment": 8
      }
    }
  }
}
```

### Error Set Definition
```json
{
  "kind": "ZigErrorSet",
  "name": "FileError",
  "canonicalReference": "std.fs.FileError",
  "language": "zig",
  "excerptTokens": [...],
  "metadata": {
    "zig": {
      "errorHandling": {
        "isErrorUnion": false,
        "isInfallible": false
      },
      "docComments": {
        "summary": "Possible errors when working with files."
      }
    }
  }
}
```

## Implementation Priority

1. **Phase 1**: Basic functions, structs, and enums with direct mappings
2. **Phase 2**: Error sets and error handling information
3. **Phase 3**: Comptime functions and generic programming
4. **Phase 4**: Opaque types and C interoperability
5. **Phase 5**: Advanced features and build configuration

## Testing Strategy

Test against well-documented Zig libraries:
- **Standard Library**: Comprehensive coverage of language features
- **zig-clap**: Command-line parsing with comptime features
- **zig-network**: Network programming with error handling
- **zig-gamedev**: Game development patterns and C interop

## Documentation Challenges

### 1. Comptime Documentation
- Compile-time execution is hard to document statically
- Generic constraints need clear representation
- Type functions require special handling

### 2. Error Propagation
- Error set unions can be complex
- Error inference across function calls
- Documentation of error conditions

### 3. Memory Safety
- Ownership transfer needs clear documentation
- Allocator parameters should be prominent
- Lifetime of allocated memory

### 4. C Interoperability
- Mapping between Zig and C types
- Calling convention documentation
- Platform-specific considerations

## Language Comparison Summary

| Feature | TypeScript | Go | Python | C# | Rust | Zig |
|---------|------------|----|---------|----|------|-----|
| Error Handling | Exceptions | Multiple returns | Exceptions | Exceptions | Result types | Error unions |
| Memory Management | GC | GC | GC | GC | Ownership | Manual |
| Generics | Yes | Limited | Duck typing | Yes | Monomorphization | Comptime |
| Null Safety | Optional | Nil | None | Nullable | Option | Optional |
| Interop | FFI | CGO | CFFI | P/Invoke | FFI | C import |
| Build System | npm/tsc | go build | pip/setup.py | MSBuild | Cargo | zig build |

## Integration Considerations

### 1. Cross-Platform Support
- Zig supports multiple target platforms
- Build configuration affects API surface
- Conditional compilation features

### 2. Package Management
- Simple dependency model
- Git-based package resolution
- Build script integration

### 3. Documentation Standards
- Doc comments with `///`
- Code examples with test validation
- Safety documentation requirements

## Future Considerations

### 1. Build System Integration
- Extract API information during build
- Handle conditional compilation
- Support for build scripts

### 2. Testing Integration
- Documentation tests (doctests)
- Compile-time test validation
- Cross-platform test considerations

### 3. Advanced Features
- WebAssembly target documentation
- Cross-compilation documentation
- Platform-specific APIs