# Cross-Language Concept Unification Analysis

This document analyzes which language-specific concepts in the universal API model appear across multiple languages and evaluates whether they should be unified into universal concepts.

## Methodology

For each concept, we evaluate:
1. **Semantic Similarity**: Do the concepts have the same fundamental meaning across languages?
2. **Documentation Value**: Would unification make documentation clearer or more confusing?
3. **Template Reusability**: Can unified concepts share documentation templates?
4. **Developer Expectations**: What would developers of each language expect to see?

## Unification Candidates

### 1. Struct ⭐ RECOMMENDED FOR UNIFICATION

**Appears in:**
- Go (GoStruct)
- C# (CSharpStruct - value type)
- Rust (currently mapped to `Class`, but is actually a struct)
- Zig (currently mapped to `Class`, but is actually a struct)
- C (would have Struct)

**Semantic Analysis:**
- **Common semantics**: Composite data types that group related fields
- **Key distinction from Class**: No inheritance (though Go has embedding)
- **Value vs Reference**: Some languages (C#) distinguish value/reference semantics
- **Documentation perspective**: All would benefit from similar struct documentation

**Proposal:** Promote to universal `Struct` kind
- Remove: `GoStruct`, `CSharpStruct`
- Add to unified concepts: `Struct`
- Language-specific features (embedding, value semantics) captured in metadata
- Templates can branch on `metadata.language` for language-specific features

**Benefits:**
- Consistent documentation structure across systems languages
- Clearer distinction from OOP classes
- Single template with language-specific sections

**Example Metadata:**
```typescript
{
  kind: 'Struct',
  metadata: {
    language: 'go',
    go: {
      embeddedFields: [...] // Go-specific embedding
    }
  }
}

{
  kind: 'Struct',
  metadata: {
    language: 'csharp',
    csharp: {
      isValueType: true, // C#-specific value semantics
      layout: 'sequential'
    }
  }
}
```

---

### 2. Annotation ⭐ RECOMMENDED FOR UNIFICATION

**Appears in:**
- Python (PythonDecorator)
- C# (CSharpAttribute)
- Java (JavaAnnotation)
- Rust (attributes in metadata, but could be promoted)

**Semantic Analysis:**
- **Common semantics**: Metadata applied to declarations
- **Syntax varies**: `@decorator` (Python), `[Attribute]` (C#), `@Annotation` (Java), `#[attr]` (Rust)
- **Documentation perspective**: All serve to document modifiers/metadata on code elements

**Proposal:** Promote to universal `Annotation` kind
- Remove: `PythonDecorator`, `CSharpAttribute`, `JavaAnnotation`
- Add to unified concepts: `Annotation`
- Syntax differences handled in templates via `metadata.language`

**Benefits:**
- Unified documentation for metadata systems
- Single template can show language-appropriate syntax
- Developers understand "annotations" as a universal concept

**Example Metadata:**
```typescript
{
  kind: 'Annotation',
  name: 'deprecated',
  metadata: {
    language: 'python',
    python: {
      decoratorType: 'function',
      arguments: ['Use new_function instead']
    }
  }
}

{
  kind: 'Annotation',
  name: 'Obsolete',
  metadata: {
    language: 'csharp',
    csharp: {
      constructorArguments: ['Use NewMethod instead'],
      namedParameters: { IsError: true }
    }
  }
}
```

---

### 3. Union ⚠️ PARTIAL UNIFICATION RECOMMENDED

**Appears in:**
- Rust (RustUnion - untagged unions for FFI)
- Zig (currently mapped to `Interface`, but is actually a union)
- C (would have Union)
- F# (FSharpDiscriminatedUnion - **tagged/discriminated**, different!)

**Semantic Analysis:**
- **Untagged unions** (Rust, Zig, C): Memory overlay, unsafe, FFI-focused
- **Tagged unions** (F#, Swift, Rust enums): Type-safe discriminated unions
- **Documentation perspective**: These are fundamentally different concepts

**Proposal:** Create TWO universal concepts
- Add `Union` for untagged unions (Rust, Zig, C)
- Add `DiscriminatedUnion` for tagged unions (F#, Rust enums, Swift enums)
- Remove: `RustUnion`, `FSharpDiscriminatedUnion`

**Benefits:**
- Clear distinction between type-safe and unsafe unions
- Different templates for different safety guarantees
- Developers get appropriate warnings/documentation

**Example:**
```typescript
// Untagged union (unsafe, FFI)
{
  kind: 'Union',
  metadata: {
    language: 'rust',
    rust: {
      isUnsafe: true,
      purpose: 'ffi'
    }
  }
}

// Tagged union (type-safe)
{
  kind: 'DiscriminatedUnion',
  metadata: {
    language: 'fsharp',
    fsharp: {
      cases: [...]
    }
  }
}
```

---

### 4. Module ⚠️ REVIEW EXISTING UNIFICATION

**Status:** Already unified as `Module`, but language-specific variants exist:
- Python (PythonModule)
- OCaml (OCamlModule)

**Issue:** The unified `Module` concept exists, but some languages still have specific kinds.

**Proposal:** Enforce use of unified `Module`
- Remove: `PythonModule`, `OCamlModule`
- Use existing unified `Module` with language-specific metadata

**Benefits:**
- Consistency with existing unified concept
- Simpler mental model
- Language differences captured in metadata

---

## Previously Considered Language-Specific (Now Removed)

### JavaInterface ✅ MERGED INTO UNIVERSAL INTERFACE

**Initially considered language-specific because:**
- Java 8+ interfaces can have default method implementations
- Can have static methods
- Seemed different from simple TypeScript interfaces

**Why it was merged into universal Interface:**
- C# interfaces also support default implementations (C# 8.0+) - no CSharpInterface created
- Kotlin interfaces also support implementations - no KotlinInterface created
- Same fundamental semantics: defining contracts for behavior
- Default methods are a feature variation, not a semantic difference
- Should be captured in metadata (`metadata.java.hasDefaultMethods`), not separate kind
- Inconsistency: was listed in both universal Interface and Java-specific

**Lesson learned:** Feature additions (like default methods) don't require new kinds if the fundamental concept remains the same. Use metadata for variations.

---

## Concepts to Keep Language-Specific

### 1. Traits and Protocols ❌ DO NOT UNIFY

**Appears in:**
- Rust (RustTrait)
- Swift (SwiftProtocol)
- Haskell (HaskellTypeClass)

**Why Keep Separate:**
- Subtle but important semantic differences
- Rust traits have associated types and default implementations
- Swift protocols have protocol extensions
- Haskell type classes have laws and more abstract semantics
- Documentation templates would be very different
- Developers expect to see language-specific terminology

**Decision:** Keep as language-specific

---

### 2. Records and Data Classes ❌ DO NOT UNIFY

**Appears in:**
- C# (CSharpRecord)
- Java (JavaRecord)
- Kotlin (KotlinDataClass)
- Scala (ScalaCaseClass)
- Haskell (HaskellData)

**Why Keep Separate:**
- Different semantics across languages
- C# records: Immutable reference types with value equality
- Java records: Immutable data carriers with restrictions
- Kotlin data classes: Auto-generated methods (can be mutable)
- Scala case classes: Immutable with pattern matching support
- Haskell data: Algebraic data types (completely different paradigm)
- Documentation needs vary significantly

**Decision:** Keep as language-specific

---

### 3. Delegates and Function Types ❌ DO NOT UNIFY

**Appears in:**
- C# (CSharpDelegate)

**Why Keep Separate:**
- C# delegates are a specific language feature
- Different from general function types/signatures
- Has specific invocation list semantics
- Documentation needs are C#-specific

**Decision:** Keep as language-specific

---

### 4. Macros ❌ DO NOT UNIFY

**Appears in:**
- Rust (RustMacro)
- Zig (ZigComptime)

**Why Keep Separate:**
- Fundamentally different mechanisms
- Rust macros are pattern-based or procedural
- Zig comptime is compile-time function execution
- Documentation approaches are completely different

**Decision:** Keep as language-specific

---

### 5. Error Handling Constructs ❌ DO NOT UNIFY

**Appears in:**
- Zig (ZigErrorSet)

**Why Keep Separate:**
- Unique to Zig's error handling model
- No equivalent in other languages
- Language-specific documentation needed

**Decision:** Keep as language-specific

---

## Summary of Recommendations

### Promote to Universal Concepts:
1. ✅ **Struct** - Unify GoStruct, CSharpStruct, and use for Rust/Zig structs
2. ✅ **Annotation** - Unify PythonDecorator, CSharpAttribute, JavaAnnotation
3. ✅ **Union** - For untagged unions (Rust, Zig, C)
4. ✅ **DiscriminatedUnion** - For tagged/discriminated unions (F#, Swift, Rust enums)

### Remove Language-Specific (use unified Module):
5. ✅ **Remove PythonModule** - Use unified Module
6. ✅ **Remove OCamlModule** - Use unified Module

### Keep Language-Specific:
- RustTrait, SwiftProtocol, HaskellTypeClass
- CSharpRecord, KotlinDataClass, HaskellData
- CSharpDelegate
- RustMacro, ZigComptime
- ZigErrorSet
- CSharpProperty, CSharpIndexer, CSharpEvent
- RustImpl
- ZigOpaque
- And all other single-language concepts

---

## Impact Assessment

### Documentation Templates

**New Templates Needed:**
- `struct.liquid` - Universal struct documentation
- `annotation.liquid` - Universal annotation documentation
- `union.liquid` - Untagged union documentation
- `discriminated-union.liquid` - Tagged union documentation

**Templates to Remove:**
- `go-struct.liquid` → use `struct.liquid`
- `csharp-struct.liquid` → use `struct.liquid`
- `python-decorator.liquid` → use `annotation.liquid`
- `csharp-attribute.liquid` → use `annotation.liquid`
- `java-annotation.liquid` → use `annotation.liquid`
- `java-interface.liquid` → use `interface.liquid`
- `python-module.liquid` → use `module.liquid`
- `ocaml-module.liquid` → use `module.liquid`

### Code Changes

**unified-api-model.ts:**
- Add new `ApiItemKind` values: `Struct`, `Annotation`, `Union`, `DiscriminatedUnion`
- Remove: `GoStruct`, `CSharpStruct`, `PythonDecorator`, `CSharpAttribute`, `JavaAnnotation`, `JavaInterface`, `PythonModule`, `OCamlModule`, `RustUnion`, `FSharpDiscriminatedUnion`

**Language extractors:**
- Update Go extractor to use `Struct` instead of `GoStruct`
- Update C# extractor to use `Struct` instead of `CSharpStruct`
- Update Python extractor to use `Annotation` instead of `PythonDecorator`
- Update C# extractor to use `Annotation` instead of `CSharpAttribute`
- Update Java extractor to use `Annotation` instead of `JavaAnnotation`
- Update Java extractor to use universal `Interface` (remove JavaInterface)
- Update all extractors to use unified `Module`

### Migration Path

For existing documentation:
1. Provide migration script to update `.api.json` files
2. Map old kinds to new kinds automatically
3. Preserve all metadata (no information loss)
4. Update templates gradually with backward compatibility

---

## Developer Confusion Risk Assessment

### Low Risk (Clear Win):
- **Struct**: Developers across languages understand structs similarly ✅
- **Module**: Already unified, just need to enforce ✅
- **Annotation**: Concept is well-understood across languages ✅

### Medium Risk (Requires Good Documentation):
- **Union vs DiscriminatedUnion**: Need clear distinction in docs ⚠️
  - Mitigation: Clear template headers explaining tagged vs untagged
  - Show language-appropriate examples

### High Risk (Avoid):
- **Do NOT unify** Traits/Protocols/TypeClasses ❌
- **Do NOT unify** Records/DataClasses ❌
- **Do NOT unify** Macros/Comptime ❌

---

## Next Steps

1. Review this analysis with stakeholders
2. Update `unified-api-model.ts` with new kinds
3. Update `universal-model.md` concept tables
4. Create new universal templates
5. Update language extractor prototypes
6. Test with sample code from each language
7. Document the unification rationale for future maintainers
