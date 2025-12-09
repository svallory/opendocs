# Universal API Model - Language and Concept Catalog

This document catalogs all programming languages and API concepts supported by the universal model.

## Supported Languages

**23 programming languages** across multiple paradigms:

### By Paradigm

**Systems Programming:** C, C++, Rust, Zig, Go
**Object-Oriented:** C#, Java, Kotlin, Swift, Dart, VB.NET, PHP, Ruby, Scala
**Functional:** Haskell, OCaml, F#, Elixir, Scala
**Scripting:** TypeScript, JavaScript, Python, Ruby, Lua, PHP
**Blockchain:** Solidity

### By Implementation Tier

**Tier 1: Full Support (10 languages)**
1. TypeScript
2. Go
3. Python
4. C#
5. Rust
6. Zig
7. Java
8. Kotlin
9. Swift
10. C++

**Tier 2: Documented Support (12 languages)**
11. JavaScript
12. C
13. Dart
14. Scala
15. PHP
16. Ruby
17. Elixir
18. Solidity
19. Lua
20. VB.NET
21. F#
22. Haskell

**Tier 3: Partial Coverage**
23. OCaml

---

## Universal Concepts (37 total)

Universal concepts work across multiple programming languages with optional properties for language-specific features.

| Concept | Description | Languages |
|---------|-------------|-----------|
| **Package** | Top-level code organization unit | TypeScript, Go, Python, Java, Rust, Dart, Kotlin, Scala, Elixir, Solidity |
| **Module** | File-level or namespace-level code organization container | TypeScript, Go, Python, C#, Rust, Zig, Ruby, Elixir, OCaml, Haskell, VB.NET |
| **Namespace** | Logical code organization | TypeScript, C#, C++, PHP, Scala, Rust |
| **Function** | Standalone callable code | ALL LANGUAGES |
| **Method** | Function attached to a type | TypeScript, Go, Python, C#, C++, Rust, Zig, Swift, Ruby, Lua, Dart, Scala, Solidity, PHP, Kotlin, VB.NET, Java |
| **Constructor** | Function that creates instances | TypeScript, Python, C#, C++, Java, Kotlin, Swift, Dart, Scala, Rust, Zig, Solidity, PHP, VB.NET, Ruby |
| **Variable** | Named value storage | ALL LANGUAGES |
| **Constant** | Immutable value | TypeScript, Go, Python, C#, C++, Rust, Zig, Swift, Dart, Kotlin, Java, Scala, Solidity, PHP, VB.NET, Elixir |
| **Property** | Field/property of a type | TypeScript, Python, C#, Kotlin, Swift, Dart, Scala, VB.NET, Ruby, Solidity |
| **Parameter** | Function/method input | ALL LANGUAGES |
| **Return Type** | Function/method output | ALL LANGUAGES (statically typed + Python type hints) |
| **Type** | Type definition | ALL LANGUAGES (explicit or implicit typing) |
| **Interface** | Contract for behavior | TypeScript, Go, C#, Java, Kotlin, Swift, Dart, Scala, PHP, VB.NET, Solidity |
| **Enum** | Enumeration of values | TypeScript, Go, Python, C#, C++, Rust, Zig, Swift, Java, Kotlin, Dart, Scala, Solidity, VB.NET, F# |
| **Class** | Object-oriented type | TypeScript, Python, C#, C++, Java, Kotlin, Swift, Dart, Scala, PHP, Ruby, VB.NET, Solidity, Lua |
| **Struct** | Composite data type without inheritance | Go, C, C++, C#, Rust, Zig, Swift, Elixir |
| **Trait** | Behavior contract with optional implementation | PHP, Scala, Rust |
| **Mixin** | Horizontal code composition | Dart, Ruby, Python, PHP, Scala |
| **Annotation** | Metadata applied to declarations | Python, C#, Java, Kotlin, Rust, PHP, Dart, Scala |
| **Macro** | Compile-time code generation and transformation | Rust, Elixir, Julia, Scala |
| **Union** | Untagged union (memory overlay) | C, C++, Rust, Zig |
| **DiscriminatedUnion** | Tagged/discriminated union (type-safe) | TypeScript, F#, Swift, Rust (enums), Scala, Kotlin (sealed), Haskell, OCaml, Elixir |
| **Singleton** | First-class singleton object | Kotlin (object), Scala (object) |
| **Record** | Immutable data carrier with auto-generated methods | Java 14+, C# 9+, Kotlin (data class), Scala (case class), Python (dataclass) |
| **Generic** | Type parameterization | TypeScript, Go, Python, C#, C++, Java, Kotlin, Rust, Zig, Swift, Dart, Scala, F#, Haskell, OCaml |
| **Documentation** | Doc comments and metadata | ALL LANGUAGES (JSDoc, Godoc, docstrings, XML docs, rustdoc, etc.) |
| **Visibility** | Access control level | TypeScript, Go, Python, C#, C++, Java, Kotlin, Rust, Swift, Dart, Scala, PHP, VB.NET, Solidity |
| **Abstract** | Cannot be instantiated | TypeScript, Python, C#, C++, Java, Kotlin, Swift, Scala, PHP, VB.NET, Solidity |
| **Static** | Type-level member | TypeScript, Go, Python, C#, C++, Java, Kotlin, Rust, Swift, Dart, Scala, PHP, VB.NET, Solidity |
| **Readonly** | Immutable field/property | TypeScript, Python, C#, C++, Rust, Kotlin, Swift, Dart, Scala, VB.NET |
| **Optional** | May be undefined/null | TypeScript, Python, C#, Kotlin, Swift, Rust (Option), Scala (Option), Dart, Haskell (Maybe), OCaml (option), F# (option) |
| **Async** | Asynchronous operation | TypeScript, Python, C#, Rust, Swift, Dart, Kotlin, Scala, F#, Zig, Elixir |
| **Generator** | Yields multiple values | TypeScript, Python, C#, Rust (iterators), Scala, PHP, Ruby, Kotlin (sequences) |
| **IndexSignature** | Bracket notation access | TypeScript, Go, Python, C#, C++, Kotlin, Swift, Scala, Dart, Solidity, Lua, Ruby |
| **CallSignature** | Function-like invocation | TypeScript, Go, Python, C#, C++, Kotlin, Swift, Rust, Scala, Dart, Lua |
| **Heritage** | Inheritance/composition | TypeScript, Python, C#, C++, Java, Kotlin, Swift, Dart, Scala, Ruby, PHP, VB.NET, Solidity |
| **Extension** | Add methods to existing types | C#, Kotlin, Swift, Dart, Scala, Ruby, Rust |
| **Operator** | Operator overloading | C++, C#, Python, Rust, Kotlin, Swift, Scala, F#, Haskell |

### Boolean Modifiers (4 total)

Optional boolean modifiers extend universal concepts for language-specific variations:

| Modifier | Applied To | Description | Languages |
|----------|------------|-------------|-----------|
| `isSealed` | Class | Cannot be extended/inherited | Kotlin, Java 17+, C#, Swift |
| `isVirtual` | Method, Function | Can be overridden in subclasses | C++, C# |
| `isInline` | Method, Function | Inlined at call site | C++, Kotlin, C# |
| `isImplicit` | Parameter, Method, Function | Implicit parameter or conversion | Scala |

---

## Language-Specific Concepts (26 total)

Unique concepts for specific languages or paradigms that cannot be meaningfully unified.

### C++ (2 concepts)

| Concept | Description |
|---------|-------------|
| `CppFriend` | Friend function/class declaration with access to private members |
| `CppConcept` | Template constraint (C++20) for compile-time interface checking |

### C# / VB.NET (3 concepts)

| Concept | Description |
|---------|-------------|
| `CSharpEvent` | Event with add/remove accessors for observer pattern |
| `CSharpDelegate` | Type-safe function pointer with invocation list |
| `VbWithEvents` | WithEvents variable declaration for event handling |

### Kotlin (2 concepts)

| Concept | Description |
|---------|-------------|
| `KotlinCompanion` | Companion object for per-class singleton members |
| `KotlinDelegatedProperty` | Property delegation for reusable behavior patterns |

### Swift (3 concepts)

| Concept | Description |
|---------|-------------|
| `SwiftProtocol` | Protocol with extensions supporting default implementations |
| `SwiftPropertyWrapper` | Property wrapper for reusable property behavior |
| `SwiftResultBuilder` | Result builder (function builder) for DSL creation |

### Rust (1 concept)

| Concept | Description |
|---------|-------------|
| `RustImpl` | Implementation block separate from type definition |

### Zig (3 concepts)

| Concept | Description |
|---------|-------------|
| `ZigErrorSet` | Error enumeration for error handling |
| `ZigComptime` | Compile-time function for generic programming |
| `ZigOpaque` | Opaque type for C FFI interoperability |

### Elixir (2 concepts)

| Concept | Description |
|---------|-------------|
| `ElixirProtocol` | Polymorphism mechanism for runtime dispatch |
| `ElixirBehaviour` | Callback specification for module contracts |

### PHP (1 concept)

| Concept | Description |
|---------|-------------|
| `PhpMagicMethod` | Magic methods (__construct, __get, etc.) for special behavior |

### Solidity (3 concepts)

| Concept | Description |
|---------|-------------|
| `SolidityModifier` | Function modifier for reusable behavior guards |
| `SolidityEvent` | Blockchain event for external logging |
| `SolidityFallback` | Fallback/receive function for default transaction handling |

### Functional Languages (7 concepts)

| Concept | Language | Description |
|---------|----------|-------------|
| `HaskellTypeClass` | Haskell | Type class with mathematical laws and constraints |
| `HaskellData` | Haskell | Algebraic data type with pattern matching |
| `HaskellNewtype` | Haskell | Zero-cost wrapper type (compile-time only) |
| `OCamlVariant` | OCaml | Polymorphic variant with structural typing |
| `OCamlFunctor` | OCaml | Module functor (parameterized module) |
| `FSharpMeasure` | F# | Unit of measure for dimensional analysis |
| `FSharpComputation` | F# | Computation expression (monadic builder) |

---

## Summary

**Total Concepts:** 58
- Universal: 37 (64%)
- Boolean Modifiers: 4 (7%)
- Language-Specific: 17 (29%)

**Total Languages:** 23
- Tier 1 (Full Support): 10 (43%)
- Tier 2 (Documented): 12 (52%)
- Tier 3 (Partial): 1 (4%)

**Paradigm Coverage:**
- Systems Programming: 5 languages
- Object-Oriented: 14 languages
- Functional: 5 languages
- Scripting: 6 languages
- Blockchain: 1 language
