# Multi-Language Support Plan for mint-tsdocs

## Objective

Extend `mint-tsdocs` to support documentation generation for multiple programming languages (Go, Python, C#, Rust, Zig) while maintaining backward compatibility with the existing TypeScript-focused workflow.

## Background

`mint-tsdocs` currently generates Mintlify-compatible MDX documentation from TypeScript code by:
1. Using `@microsoft/api-extractor` to generate `.api.json` files from TypeScript
2. Loading these files with `@microsoft/api-extractor-model`
3. Converting the API model to MDX using templates

The core challenge is that `api-extractor` and its model are TypeScript-specific. To support other languages, we need:
1. A unified JSON schema that can represent APIs from any language
2. Language-specific extractors that output this unified format
3. Updates to `mint-tsdocs` to handle language-specific rendering

## Critical Context: Architecture Reality

Understanding the actual architecture is essential for making the right design decisions:

### Templates Are Language-Specific
- There will **NEVER** be branching on language within templates (e.g., `{% if language == 'rust' %}`)
- Each language has dedicated template files: `rust/trait.liquid`, `php/trait.liquid`, etc.
- Templates are written once per language and maintained independently
- This means optional fields in the model are perfectly fine - each template only uses what it needs

### Models Are Single-Language
- A single `.api.json` file contains **ONLY** one language's API items
- There will **NEVER** be mixing of PHP classes and Rust structs in the same model
- Each extractor works in isolation and outputs language-specific JSON
- This means type-level validation of cross-language concerns is unnecessary

### Design Perspective: Tool Maintainers, Not End Developers
- **End developers** using the docs never see concepts from other languages
- **Tool maintainers** (extractor authors, template writers) benefit from simplicity
- Fewer types = less code to maintain = less synchronization burden
- Optional fields are better than separate types when templates are language-specific

**Key Principle**: Optimize for tool maintainability, not theoretical purity.

## Approach

### Phase 1: Define Unified API Model (COMPLETED)

**Goal**: Create a strict superset of the `@microsoft/api-extractor-model` JSON schema that accommodates all target languages.

**Key Principle**: Backward compatibility. Every valid `api-extractor` JSON file must be valid in the unified model.

**Deliverables**:
- ✅ `unified-api-model.ts`: TypeScript definitions for the extended model
- ✅ `universal-model.md`: Complete catalog of unified and language-specific concepts
- ✅ `concept-scrutiny-analysis.md`: Detailed analysis of 68 language-specific concepts
- ✅ `trait-unification-analysis.md`: In-depth evaluation of Trait unification
- ✅ `additional-scrutiny-findings.md`: Analysis of DartFactory, Mixin, and Trait merging

**Design Decisions**:
1. **No prefixes**: Use the original `ApiItemKind` enum and extend it (not `UnifiedApiItemKind`)
2. **Language field**: Add `language: SourceLanguage` to identify the source language
3. **Metadata pattern**: Use `metadata.{language}` for language-specific data that doesn't fit the base schema
4. **Unify aggressively**: Use optional fields for language-specific features rather than creating separate kinds
5. **Boolean modifiers**: Prefer `isSealed`, `isInline`, `isVirtual` over separate kinds when appropriate

**Concept Scrutiny Results**:
Through rigorous analysis (see `concept-scrutiny-analysis.md`), we achieved:
- **62% reduction** in language-specific concepts (68 → 26)
- **13 concepts merged** into universal types (GoInterface → Interface, PythonClass → Class, etc.)
- **2 new universal concepts** created (Singleton for Kotlin/Scala objects, Record for immutable data classes)
- **4 concepts converted** to boolean modifiers (isSealed, isInline, isVirtual, isImplicit)
- **17 non-API concepts removed** (runtime constructs, implementation details)
- **38% reduction** in template files needed (100 → 62)

#### Decision-Making Framework

When evaluating whether a concept should be universal or language-specific, apply these **three critical questions**:

**1. Is this really unique, or just a variation of a universal concept?**
- Example: `GoMethod` with receiver → Universal `Method` with `metadata.go.receiver`
- Example: Java interfaces with default methods → Universal `Interface` (feature variation, not semantic difference)
- Example: Kotlin `object` → New universal `Singleton` (appears in Kotlin and Scala)

**2. Is this syntactically defined in code, or "a way of looking" at other concepts?**
- ❌ Remove: `PythonDescriptor` (protocol pattern, not a code construct)
- ❌ Remove: `GoChannel` (a type, not an API item kind)
- ✅ Keep: `Class`, `Interface`, `Function` (actual code declarations)

**3. Does this help document a library for developers, or is it an internal detail?**
- ❌ Remove: `GoGoroutine` (runtime execution, not API surface)
- ❌ Remove: `ZigTestBlock` (tests, not public API)
- ✅ Keep: `Method`, `Property`, `Constructor` (public API elements)

**Guidelines for Universal vs Language-Specific:**

**Make it universal when:**
- ✅ The concept exists in 2+ languages with similar semantics
- ✅ It can be documented with the same template structure across languages
- ✅ Language-specific features can be captured as optional fields or metadata
- ✅ It represents a fundamental programming construct (class, function, interface)

**Keep it language-specific when:**
- ❌ It's unique to one language (RustImpl, ZigComptime, ZigErrorSet)
- ❌ It represents a paradigm-defining feature (RustTrait with associated types, SwiftProtocol with extensions)
- ❌ Templates would be completely different across languages
- ❌ Unification would create confusion (untagged Union vs discriminated DiscriminatedUnion)

**Use boolean modifiers when:**
- ✅ It's a variation of an existing concept (sealed class → `Class.isSealed`)
- ✅ It's a binary property (virtual/non-virtual, inline/not-inline)
- ✅ Multiple languages might adopt the feature over time

**Use optional fields when:**
- ✅ A feature appears in some languages but not others (Trait.associatedTypes for Rust)
- ✅ Templates are language-specific anyway (no branching needed)
- ✅ It reduces the number of types to maintain
- ✅ Extractors work in isolation (no cross-language validation needed)

### Phase 2: Concept Scrutiny and Unification (COMPLETED)

**Goal**: Systematically review all language-specific concepts to identify unification opportunities and reduce maintenance burden.

**Methodology**:
1. Applied three critical questions to every concept
2. Analyzed semantic similarities across 20+ languages
3. Evaluated whether concepts are API items or implementation details
4. Determined optimal representation (universal type, boolean modifier, or language-specific)

**Status**:
- ✅ **Concept Scrutiny**: Analyzed all 68 initial language-specific concepts
- ✅ **Unification Analysis**: Identified 13 concepts to merge into universal types
- ✅ **Trait Analysis**: Deep evaluation of PHP/Scala/Rust trait unification
- ✅ **Additional Findings**: DartFactory, Mixin, and other refinements
- ✅ **Universal Model**: Updated with 36 universal + 26 language-specific concepts

**Key Decisions**:
1. **Struct**: Universal (Go, C#, Rust, Zig, C)
2. **Annotation**: Universal (Python decorators, C# attributes, Java annotations)
3. **Union**: Split into `Union` (untagged) and `DiscriminatedUnion` (tagged)
4. **Trait**: Universal with optional `associatedTypes` field (PHP, Scala, Rust)
5. **Mixin**: New universal concept (Dart, Ruby, Python, PHP, Scala)
6. **Singleton**: New universal concept (Kotlin object, Scala object)
7. **Record**: New universal concept (Java, C#, Kotlin data class, Scala case class)

### Phase 3: Language-Specific Extractor Specifications (NOT STARTED)

**Goal**: For each target language, document extractor implementation requirements:
1. Which universal concepts to use for language constructs
2. What language-specific metadata to populate
3. How to handle language-specific features as optional fields
4. Recommended tooling for AST parsing and extraction

**Priority Languages**:
- ⏳ Go: Using `go/ast` and `go/parser`
- ⏳ Python: Using `griffe` library
- ⏳ C#: Using Roslyn APIs
- ⏳ Rust: Using `syn` crate
- ⏳ Zig: Using Zig's `std.zig.Ast`

### Phase 4: Build Language Extractors (NOT STARTED)

**Goal**: Create tools that parse source code and output unified `.api.json` files following the finalized model.

**Approach**: Each extractor should:
1. Parse the source code into an AST
2. Extract public API items (functions, classes, etc.)
3. Extract documentation comments (Godoc, docstrings, XML docs, etc.)
4. Map to the unified JSON schema using appropriate universal concepts
5. Populate language-specific metadata for unique features
6. Output `.api.json` files compatible with `mint-tsdocs`

**Prototype Priority**: Start with Go or Python to validate the unified model in practice.

### Phase 5: Update mint-tsdocs (NOT STARTED)

**Goal**: Modify `mint-tsdocs` to handle the unified model.

**Required Changes**:
1. **Decouple from `api-extractor-model`**: Create an abstraction layer so the code doesn't directly depend on the TypeScript-specific classes
2. **Language-aware rendering**: Update `TemplateDataConverter` to handle new kinds and metadata
3. **Syntax highlighting**: Ensure code blocks use the correct language identifier
4. **Signature formatting**: Handle language-specific syntax (e.g., Go receivers, Python decorators)
5. **Template updates**: Modify Liquid templates to conditionally render language-specific features

## Current State

### Completed ✅
- **Phase 1**: Unified API model defined
  - Core TypeScript types (`unified-api-model.ts`)
  - Comprehensive universal concept catalog (`universal-model.md`)
  - Model changes documentation (`model-changes-report.md`)

- **Phase 2**: Concept scrutiny and unification
  - Systematic analysis of 68 language-specific concepts
  - **62% reduction** in language-specific types (68 → 26)
  - **38% reduction** in template files needed (100 → 62)
  - Decision-making framework established
  - Key unifications: Struct, Annotation, Trait, Mixin, Singleton, Record

### Next Steps 🎯
1. **Validate the model**: Review unified model and decision-making framework with stakeholders
2. **Write extractor specs**: Document how each language maps to universal concepts (Phase 3)
3. **Build prototype extractor**: Implement Go or Python extractor to validate model in practice (Phase 4)
4. **Create language templates**: Develop Liquid templates for each target language
5. **Refactor mint-tsdocs**: Update tool to work with unified model instead of api-extractor-model (Phase 5)

### Critical Learnings 💡
1. **Templates are language-specific** - No branching on language needed
2. **Models are single-language** - No cross-language validation needed
3. **Optional fields work fine** - When templates don't branch on language
4. **Optimize for maintainers** - Fewer types = less code = easier maintenance
5. **Three critical questions** - Framework for universal vs language-specific decisions

## Files in This Directory

### Core Documentation
- `README.md` - This file: project overview, approach, and learnings
- `unified-api-model.ts` - TypeScript definitions for the extended API model
- `model-changes-report.md` - Summary of extensions to the base API Extractor model

### Universal Model Definition
- `universal-model.md` - **Complete catalog** of unified and language-specific concepts
  - 36 universal concepts (Class, Interface, Function, Struct, Trait, etc.)
  - 26 language-specific concepts (RustImpl, SwiftProtocol, ZigErrorSet, etc.)
  - Boolean modifiers (isSealed, isInline, isVirtual, isImplicit)
  - Migration notes and rationale

### Analysis Documents
- `concept-scrutiny-analysis.md` - **Systematic analysis of 68 language-specific concepts**
  - Applied three critical questions to each concept
  - Identified 13 concepts to merge, 17 to remove, 4 to convert to booleans
  - Detailed rationale for each decision

- `concept-unification-analysis.md` - **Cross-language unification evaluation**
  - Which concepts appear in multiple languages
  - Semantic similarity analysis
  - Template reusability assessment
  - Unification recommendations (Struct, Annotation, Union, Module)

- `trait-unification-analysis.md` - **In-depth Trait unification evaluation**
  - 10-criterion comparison: Universal Trait vs separate RustTrait
  - Analysis of associated types, template complexity, type safety
  - Recommendation: Universal Trait with optional `associatedTypes` field
  - Tool maintainer perspective prevails over theoretical purity

- `additional-scrutiny-findings.md` - **Refinements from critical questions**
  - DartFactory analysis (remove: it's just a factory method)
  - Mixin universalization (Dart, Ruby, Python, PHP, Scala)
  - PHP/Scala/Rust Trait comparison and unification strategy

### Reference
- `research/api-extractor-model/` - Clone of original `@microsoft/api-extractor-model` source

### Legacy (superseded by universal-model.md)
- `go_support_analysis.md` - Initial Go-specific analysis
- `python_support_analysis.md` - Initial Python-specific analysis

## How It All Works Together

### Example: Documenting a Rust Iterator Trait

**1. Rust Source Code:**
```rust
/// An iterator over items of type `T`.
pub trait Iterator {
    /// The type of elements being iterated.
    type Item;

    /// Advances the iterator and returns the next value.
    fn next(&mut self) -> Option<Self::Item>;
}
```

**2. Rust Extractor Output (`.api.json`):**
```json
{
  "kind": "Trait",
  "name": "Iterator",
  "description": "An iterator over items of type `T`.",
  "methods": [
    {
      "name": "next",
      "description": "Advances the iterator and returns the next value.",
      "parameters": [{ "name": "self", "type": "&mut self" }],
      "returnType": "Option<Self::Item>"
    }
  ],
  "associatedTypes": [
    {
      "name": "Item",
      "description": "The type of elements being iterated."
    }
  ],
  "metadata": {
    "language": "rust"
  }
}
```

**3. Rust Template (`templates/rust/trait.liquid`):**
```liquid
{% layout "layout" %}

{% block content %}
# {{ name }}

{{ description }}

{% if associatedTypes and associatedTypes.size > 0 %}
## Associated Types
{% for assocType in associatedTypes %}
### `{{ assocType.name }}`
{{ assocType.description }}
{% endfor %}
{% endif %}

## Methods
{% for method in methods %}
### `{{ method.name }}`
{{ method.description }}
{% endfor %}
{% endblock %}
```

**4. Generated MDX:**
```mdx
---
title: Iterator
---

# Iterator

An iterator over items of type `T`.

## Associated Types

### `Item`
The type of elements being iterated.

## Methods

### `next`
Advances the iterator and returns the next value.
```

### Key Points:
- **Extractor** uses universal `Trait` concept with optional `associatedTypes` field
- **Template** is Rust-specific, no branching needed
- **Model** is single-language, no PHP traits mixed in
- **Tool maintainers** have one `Trait` interface to maintain, not separate `RustTrait`

## Common Pitfalls to Avoid

### ❌ Anti-Pattern: Separate Types for Similar Concepts
**Wrong:**
```typescript
interface PHPTrait { methods: Method[], properties: Property[] }
interface ScalaTrait { methods: Method[], properties: Property[] }
interface RustTrait { methods: Method[], associatedTypes: AssociatedType[] }
```

**Right:**
```typescript
interface Trait {
  methods: Method[];
  properties?: Property[];  // PHP, Scala
  associatedTypes?: AssociatedType[];  // Rust
}
```

**Why:** Templates are language-specific anyway. No branching needed. Less code to maintain.

### ❌ Anti-Pattern: Creating Types for Runtime Concepts
**Wrong:**
```typescript
interface GoGoroutine { ... }  // Runtime execution
interface LuaCoroutine { ... }  // Runtime execution
```

**Right:** Don't model runtime concepts at all. Only model API surface.

**Why:** Documentation is about API contracts, not execution behavior.

### ❌ Anti-Pattern: Creating Types for "Ways of Looking"
**Wrong:**
```typescript
interface PythonDescriptor { ... }  // Protocol pattern
interface GoChannel { ... }  // It's a type, not a kind
```

**Right:** Use universal concepts or metadata to capture these patterns.

**Why:** If it's not syntactically declared in code, it's not an API item kind.

### ❌ Anti-Pattern: Boolean Flags in Type Names
**Wrong:**
```typescript
interface SealedClass { ... }
interface RegularClass { ... }
interface VirtualMethod { ... }
interface NonVirtualMethod { ... }
```

**Right:**
```typescript
interface Class { isSealed?: boolean; ... }
interface Method { isVirtual?: boolean; ... }
```

**Why:** Binary properties should be boolean fields, not separate types.

### ❌ Anti-Pattern: Optimizing for Developer Confusion
**Wrong Reasoning:** "PHP developers might get confused if they see Rust's `associatedTypes` field"

**Right Reasoning:** "Templates are language-specific. PHP developers only see PHP templates. Tool maintainers benefit from fewer types."

**Why:** Remember who your audience is: tool maintainers, not end developers.

## Quick Reference: Decision Tree

When you encounter a language-specific concept, follow this decision tree:

```
1. Is it syntactically declared in code?
   ├─ NO → Remove (it's a runtime/protocol pattern)
   └─ YES → Continue to 2

2. Does it document public API?
   ├─ NO → Remove (it's implementation detail)
   └─ YES → Continue to 3

3. Does it exist in 2+ languages with similar semantics?
   ├─ YES → Continue to 4
   └─ NO → Continue to 5

4. Can language-specific features be optional fields?
   ├─ YES → MAKE UNIVERSAL with optional fields
   └─ NO → Continue to 5

5. Is it just a variation of an existing concept?
   ├─ YES → Add boolean modifier (isSealed, isVirtual)
   └─ NO → KEEP LANGUAGE-SPECIFIC

Examples:
- GoMethod → Universal Method (Step 3: YES, Step 4: YES)
- KotlinSealed → Class.isSealed (Step 5: YES)
- RustImpl → Language-specific (Step 3: NO, unique to Rust)
- GoGoroutine → Remove (Step 1: NO, runtime concept)
```

## Key Design Constraints

1. **Backward Compatibility**: Existing TypeScript projects must continue to work without changes
2. **Extensibility**: The model should be easy to extend for future languages
3. **Type Safety**: Use TypeScript's type system to enforce correctness
4. **Minimal Coupling**: Avoid tight coupling to any specific language's semantics
5. **Documentation First**: Every extension must be documented with rationale
6. **Maintainability First**: Optimize for tool creators, not theoretical purity
7. **Templates Over Types**: When templates are language-specific, optional fields are better than separate types

## Future Considerations

### When Adding New Languages
1. **Start with the decision tree**: Apply the three critical questions to each concept
2. **Check for existing universal concepts**: Don't create language-specific types if a universal one exists
3. **Use optional fields liberally**: If templates are language-specific, optional fields are fine
4. **Document the rationale**: Explain why each decision was made
5. **Update universal-model.md**: Keep the catalog up-to-date

### When Building Extractors
1. **Use universal concepts first**: Map to existing universal types whenever possible
2. **Populate metadata for unique features**: Use `metadata.{language}` for language-specific quirks
3. **Don't validate cross-language concerns**: Each extractor works in isolation
4. **Output clean JSON**: Follow the schema strictly for compatibility
5. **Test with real codebases**: Validate against actual production code

### When Writing Templates
1. **One language per template directory**: Never branch on language within templates
2. **Use optional fields freely**: Check for existence with `{% if field %}`
3. **Follow Mintlify conventions**: Use proper MDX frontmatter and components
4. **Document template variables**: Explain what each template expects
5. **Reuse layout templates**: Share common structure across API item types

### Potential Model Refinements
As we build extractors and templates, we may discover:
- **More unification opportunities**: Concepts that initially seemed different may be similar
- **Missing universal concepts**: Patterns that appear across many languages
- **Overly complex metadata**: Language-specific data that should become optional fields
- **Template needs**: API item properties that templates commonly need

**Process for model changes:**
1. Document the pain point (extractor complexity, template awkwardness, etc.)
2. Analyze affected languages and extractors
3. Propose the change with rationale
4. Update universal-model.md and this README
5. Create migration plan for existing extractors/templates

## Summary

This multi-language support plan successfully:
- ✅ Established architecture understanding (templates are language-specific, models are single-language)
- ✅ Created decision-making framework (three critical questions + decision tree)
- ✅ Reduced concept count by 62% through aggressive unification (68 → 26 language-specific)
- ✅ Reduced template files needed by 38% (100 → 62)
- ✅ Prioritized tool maintainability over theoretical purity
- ✅ Documented common pitfalls and anti-patterns

**The unified model is ready for implementation.** Next steps:
1. Review and validate with stakeholders
2. Write extractor specifications for priority languages
3. Build prototype extractor (Go or Python)
4. Create language-specific templates
5. Refactor mint-tsdocs to use the unified model

**Key insight:** When templates are language-specific and models are single-language, optional fields in universal types are superior to creating separate language-specific types. This reduces maintenance burden for tool creators while providing the same developer experience for end users.
