import {
    ApiItemKind as BaseApiItemKind,
    IApiItemJson as IBaseApiItemJson,
    IApiPackageJson as IBaseApiPackageJson
} from './research/api-extractor-model/src/items/ApiItem';

/**
 * Extended ApiItemKind to support multiple languages.
 * This is a superset of the original ApiItemKind.
 */
export const ApiItemKind = {
    ...BaseApiItemKind,

    // --- Go Specific Kinds ---
    /**
     * Represents a Go struct.
     * Distinct from Class because it doesn't support inheritance in the OOP sense (only embedding).
     */
    GoStruct: 'GoStruct',

    /**
     * Represents a Go interface.
     * Distinct because Go interfaces are satisfied implicitly.
     */
    GoInterface: 'GoInterface',

    /**
     * Represents a Go receiver method.
     * Distinct to explicitly model the receiver type.
     */
    GoMethod: 'GoMethod',

    // --- Python Specific Kinds ---
    /**
     * Represents a Python module.
     * Distinct from Namespace because it maps 1:1 with a file or directory with __init__.py.
     */
    PythonModule: 'PythonModule',

    /**
     * Represents a Python class.
     * Can handle multiple inheritance and dynamic metaclasses.
     */
    PythonClass: 'PythonClass',

    /**
     * Represents a Python decorator.
     * While often just a function, in docs it acts as a modifier on other items.
     */
    PythonDecorator: 'PythonDecorator',

    // --- C# Specific Kinds ---
    /**
     * Represents a C# property.
     * Distinct from fields because properties have getters/setters.
     */
    CSharpProperty: 'CSharpProperty',

    /**
     * Represents a C# indexer.
     * Special syntax for array-like access (this[int index]).
     */
    CSharpIndexer: 'CSharpIndexer',

    /**
     * Represents a C# event.
     * First-class construct with add/remove accessors.
     */
    CSharpEvent: 'CSharpEvent',

    /**
     * Represents a C# delegate.
     * Type-safe function pointer with specific signature.
     */
    CSharpDelegate: 'CSharpDelegate',

    /**
     * Represents a C# attribute.
     * Metadata annotation that can be applied to various constructs.
     */
    CSharpAttribute: 'CSharpAttribute',

    /**
     * Represents a C# record.
     * Immutable reference type with value equality (C# 9.0+).
     */
    CSharpRecord: 'CSharpRecord',

    /**
     * Represents a C# struct.
     * Value type with different semantics from classes.
     */
    CSharpStruct: 'CSharpStruct',

    // --- Rust Specific Kinds ---
    /**
     * Represents a Rust trait.
     * Different from interfaces due to associated types and default implementations.
     */
    RustTrait: 'RustTrait',

    /**
     * Represents a Rust implementation block.
     * Separate from type definitions, enabling extension methods.
     */
    RustImpl: 'RustImpl',

    /**
     * Represents a Rust macro.
     * Compile-time code generation construct.
     */
    RustMacro: 'RustMacro',

    /**
     * Represents a Rust type alias.
     * Can include generic parameters and constraints.
     */
    RustType: 'RustType',

    /**
     * Represents a Rust union.
     * Untagged unions for FFI and low-level programming.
     */
    RustUnion: 'RustUnion',

    // --- Zig Specific Kinds ---
    /**
     * Represents a Zig error set.
     * Unique to Zig's error handling system.
     */
    ZigErrorSet: 'ZigErrorSet',

    /**
     * Represents a Zig comptime function.
     * Executes at compile time for generic programming.
     */
    ZigComptime: 'ZigComptime',

    /**
     * Represents a Zig opaque type.
     * Abstract type for C interoperability.
     */
    ZigOpaque: 'ZigOpaque'
} as const;

export type ApiItemKind = (typeof ApiItemKind)[keyof typeof ApiItemKind];

/**
 * Supported languages in the unified model.
 */
export type SourceLanguage = 'typescript' | 'go' | 'python' | 'csharp' | 'rust' | 'zig';

/**
 * Base interface for all unified API items.
 * Strictly extends the structure of the original ApiItem.
 */
export interface IApiItemJson extends IBaseApiItemJson {
    kind: ApiItemKind;

    /**
     * The source language of this item.
     * Allows consumers to apply language-specific rendering logic.
     */
    language: SourceLanguage;

    /**
     * Language-specific metadata.
     */
    metadata?: {
        go?: IGoMetadata;
        python?: IPythonMetadata;
        ts?: ITsMetadata;
        csharp?: ICSharpMetadata;
        rust?: IRustMetadata;
        zig?: IZigMetadata;
    };
}

/**
 * Metadata specific to Go items.
 */
export interface IGoMetadata {
    /**
     * The package path (e.g., "github.com/user/repo/pkg").
     */
    importPath?: string;

    /**
     * For methods, the receiver definition.
     */
    receiver?: {
        name: string;
        type: string;
        isPointer: boolean;
    };

    /**
     * Struct embedding information.
     */
    embeddedFields?: Array<{
        name: string;
        type: string;
    }>;
}

/**
 * Metadata specific to Python items.
 */
export interface IPythonMetadata {
    /**
     * The full dotted path to the item (e.g., "pandas.DataFrame.head").
     */
    qualname?: string;

    /**
     * Decorators applied to this item.
     */
    decorators?: Array<{
        name: string;
        arguments?: string[];
    }>;

    /**
     * Python specific function arguments (args, kwargs).
     */
    arguments?: {
        hasVarargs: boolean; // *args
        hasKwargs: boolean;  // **kwargs
        keywordOnlyArgs?: string[];
    };
}

/**
 * Metadata specific to TypeScript items (for backward compatibility/extensibility).
 */
export interface ITsMetadata {
    // Existing TS specific flags could go here if extracted from the main model
}

/**
 * Extension of the Package JSON to include language.
 */
export interface IApiPackageJson extends IBaseApiPackageJson {
    language: SourceLanguage;
}

/**
 * Metadata specific to C# items.
 */
export interface ICSharpMetadata {
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

/**
 * Metadata specific to Rust items.
 */
export interface IRustMetadata {
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

/**
 * Metadata specific to Zig items.
 */
export interface IZigMetadata {
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
