# Universal API Model - Type Definition

This directory contains the universal type definition that serves as the foundation for representing type definitions across all programming languages in a unified format.

## Design Philosophy

Our approach unifies type representations across languages while preserving semantic accuracy:

1. **One Interface to Rule Them All**: Single `Type` interface handles all languages
2. **Complete API Surface**: Captures everything developers need to know about a type
3. **Language-Agnostic Core**: The `definition` works across all languages with optional properties
4. **Rich Language Extensions**: Deep language-specific features in structured `metadata`
5. **Template-Ready**: Comprehensive data structure for documentation generation

## File Structure

- `type.ts` - The universal Type interface and supporting types
- `README.md` - This documentation file

## The Type Interface

The `Type` interface represents any type definition across all programming languages. It consists of two main sections:

### 1. Definition (Language-Agnostic Core)

Contains everything that affects how developers interact with the type:
- **Constructors**: How to create instances
- **Properties**: Accessible fields/data
- **Methods**: Callable behavior
- **Index Signatures**: Bracket notation access
- **Call Signatures**: Function-like invocation
- **Type Parameters**: Generic type information
- **Heritage**: Inheritance/composition relationships
- **Modifiers**: Essential properties like visibility, abstract, sealed, etc.

### 2. Metadata (Language-Specific Extensions)

Contains documentation and deep language-specific features:
- **Documentation**: Summary, examples, deprecation notices, etc.
- **Source Location**: For linking to source code
- **Cross-References**: Inheritance and usage relationships
- **Language Extensions**: Deep features specific to each language

## Language Extension Strategy

Instead of a generic `[language: string]: any`, we provide structured extensions for each language:

### TypeScript Extensions

```typescript
typescript?: {
  isUtilityType?: boolean;        // Array, Promise, Record, etc.
  isConditional?: boolean;        // T extends U ? X : Y
  isMapped?: boolean;             // { [K in keyof T]: T[K] }
  isTemplateLiteral?: boolean;    // `hello-${string}`
  isIntrinsic?: boolean;          // Built-in types like string, number
  mappedTypeParams?: {
    readonlyModifier?: 'plus' | 'minus';
    optionalModifier?: 'plus' | 'minus';
  };
}
```

### Go Extensions

```typescript
go?: {
  isStruct?: boolean;             // vs interface
  isInterface?: boolean;          // vs struct
  embeddedTypes?: string[];       // Embedded struct types
  isPointerReceiver?: boolean;    // Methods with pointer receivers
  isValueReceiver?: boolean;      // Methods with value receivers
}
```

### Python Extensions

```typescript
python?: {
  isDataclass?: boolean;          // @dataclass decorated class
  isNamedTuple?: boolean;         // typing.NamedTuple
  isTypedDict?: boolean;          // typing.TypedDict
  metaclass?: string;             // Metaclass name
  isAbstract?: boolean;           // abc.ABC metaclass
  isFinal?: boolean;              // @final decorated class
  isProtocol?: boolean;           // typing.Protocol
  isGeneric?: boolean;            // typing.Generic base
}
```

### C# Extensions

```typescript
csharp?: {
  isRecord?: boolean;             // record type
  isStruct?: boolean;             // value type
  isClass?: boolean;              // reference type
  isInterface?: boolean;          // interface type
  isEnum?: boolean;               // enum type
  isDelegate?: boolean;           // delegate type
  namespace?: string;             // Full namespace
  assembly?: string;              // Containing assembly
  isStatic?: boolean;             // static class
  isPartial?: boolean;            // partial class
  isUnsafe?: boolean;             // contains unsafe code
}
```

### Rust Extensions

```typescript
rust?: {
  isStruct?: boolean;             // struct type
  isEnum?: boolean;               // enum type
  isUnion?: boolean;              // union type
  derives?: string[];             // #[derive(...)] traits
  traitImplementations?: string[]; // Manual trait impls
  isCopy?: boolean;               // impl Copy
  isClone?: boolean;              // impl Clone
  isSend?: boolean;               // impl Send
  isSync?: boolean;               // impl Sync
  lifetimeBounds?: string[];      // 'a: 'b lifetime constraints
  isGeneric?: boolean;            // Has generic parameters
  isConst?: boolean;              // Compile-time type
  isPin?: boolean;                // Pin<P> wrapper
}
```

### Zig Extensions

```typescript
zig?: {
  isStruct?: boolean;             // struct type
  isEnum?: boolean;               // enum type
  isUnion?: boolean;              // union type
  isOpaque?: boolean;             // opaque type
  isPacked?: boolean;             // packed struct
  isExtern?: boolean;             // extern struct/enum
  isExport?: boolean;             // exported to C
  alignment?: number;             // Custom alignment
  backingInteger?: string;        // For enums: underlying type
  isTaggedUnion?: boolean;        // Tagged union variant
}
```

### Additional Language Extensions (Future)

```typescript
// Haskell
haskell?: {
  deriving?: string[];            // deriving clauses
  typeClassInstances?: string[];  // Instance declarations
  isNewtype?: boolean;            // newtype vs data
  isData?: boolean;               // data declaration
  kind?: string;                  // Type kind (*, * -> *, etc.)
}

// OCaml
ocaml?: {
  variantType?: 'regular' | 'polymorphic'; // Regular vs polymorphic variants
  rowVariables?: boolean;         // Has row polymorphism
  isPrivate?: boolean;            // Private type abbreviation
}

// F#
fsharp?: {
  isRecord?: boolean;             // Record type
  isDiscriminatedUnion?: boolean; // Discriminated union
  isMeasure?: boolean;            // Unit of measure
  isStruct?: boolean;             // Value type
  isInterface?: boolean;          // Interface type
}

// Swift
swift?: {
  isClass?: boolean;              // Class type
  isStruct?: boolean;             // Struct type
  isEnum?: boolean;               // Enum type
  isProtocol?: boolean;           // Protocol type
  associatedTypes?: string[];     // Protocol associated types
}

// Java
java?: {
  isRecord?: boolean;             // Record type
  isEnum?: boolean;               // Enum type
  isInterface?: boolean;          // Interface type
  isClass?: boolean;              // Class type
  isAnnotation?: boolean;         // Annotation type
  isAbstract?: boolean;           // Abstract class
  isFinal?: boolean;              // Final class
}

// Kotlin
kotlin?: {
  isData?: boolean;               // data class
  isSealed?: boolean;             // sealed class
  isInterface?: boolean;          // interface
  isObject?: boolean;             // object declaration
  isCompanion?: boolean;          // companion object
}
```

## Usage Guidelines

### For Language Extractor Developers:

1. **Populate Universal Fields First**: Always fill the core `definition` fields
2. **Use Language Extensions**: Add relevant language-specific metadata
3. **Preserve Semantic Accuracy**: Don't force concepts that don't fit
4. **Provide Rich Documentation**: Include examples and cross-references
5. **Include Source Locations**: Enable linking back to source code

### For Template Developers:

1. **Start with Universal Fields**: All languages will have constructors, properties, methods, etc.
2. **Check Language in Metadata**: Use `metadata.language` for language-specific rendering
3. **Use Language Extensions**: Access deep features through structured metadata
4. **Fallback Gracefully**: Handle missing optional properties
5. **Preserve Language Idioms**: Show concepts using familiar language terminology

## Benefits of This Approach

1. **One Interface to Learn**: Developers understand one model for all languages
2. **Complete Coverage**: Rich enough for comprehensive documentation
3. **Language Accuracy**: Preserves semantic meaning while unifying structure
4. **Template Efficiency**: Single template logic with language-specific branches
5. **Future-Proof**: Easy to extend for new languages or features
6. **Type Safety**: Structured extensions instead of generic objects

## Creating Other Universal Models

Use this Type interface as a template for creating other universal concepts:

1. **Identify Universal Structure**: What fields do all languages share?
2. **Extract Language-Agnostic Core**: Put universal fields in the main definition
3. **Design Optional Properties**: For features not universally supported
4. **Create Structured Extensions**: Specific interfaces for each language's deep features
5. **Preserve Semantic Meaning**: Don't force false equivalencies
6. **Document Thoroughly**: Explain the design decisions and usage patterns

This approach gives us comprehensive, language-aware API documentation while maintaining consistency and developer ergonomics across all supported programming languages.
