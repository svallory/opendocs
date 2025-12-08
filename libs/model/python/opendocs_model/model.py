"""Core OpenDocs model types."""

from typing import Any, Dict, List, Literal, Optional, TypedDict
from typing_extensions import NotRequired

# Version
VERSION = "0.2.0"


class Generator(TypedDict, total=False):
    """Information about the documentation generator."""

    name: str
    version: str


class Repository(TypedDict, total=False):
    """Source repository information for linking to source code."""

    type: str  # Repository type (git, svn, mercurial, etc.)
    url: str  # Repository URL
    fileUrlTemplate: NotRequired[str]  # Template for generating file URLs: {repo}/blob/{hash}/{path}#L{line}


class Metadata(TypedDict, total=False):
    """Documentation set metadata."""

    created: NotRequired[str]
    modified: NotRequired[str]
    generator: NotRequired[Generator]
    repository: NotRequired[Repository]


class Deprecated(TypedDict, total=False):
    """Deprecation information."""

    message: NotRequired[str]
    since: NotRequired[str]
    alternative: NotRequired[str]


class DocTag(TypedDict, total=False):
    """Documentation tag (e.g., @param, @returns)."""

    name: str  # Tag name without @
    content: str  # Tag content
    parameters: NotRequired[Dict[str, str]]  # Tag parameters (name, type, etc.)


class DocBlock(TypedDict, total=False):
    """Structured documentation content."""

    content: NotRequired[str]
    remarks: NotRequired[str]
    tags: NotRequired[Dict[str, List[Any]]]  # Record<string, (string | DocTag)[]>
    examples: NotRequired[List[str]]
    deprecated: NotRequired[Deprecated]
    see: NotRequired[List[str]]
    metadata: NotRequired[Dict[str, Any]]


class Location(TypedDict, total=False):
    """Source code location."""

    path: str  # File path (relative to project root)
    number: int  # Line number (1-indexed)
    column: NotRequired[int]  # Column number (1-indexed)


class TypeReference(TypedDict, total=False):
    """Reference to a type."""

    name: str
    ref: NotRequired[str]  # $ref
    typeArguments: NotRequired[List["TypeReference"]]
    isUnion: NotRequired[bool]
    isIntersection: NotRequired[bool]
    isArray: NotRequired[bool]
    isPromise: NotRequired[bool]
    isNullable: NotRequired[bool]


class Parameter(TypedDict, total=False):
    """Function parameter."""

    name: str
    type: NotRequired[TypeReference]
    isOptional: NotRequired[bool]
    isRest: NotRequired[bool]
    defaultValue: NotRequired[str]
    description: NotRequired[str]


class TypeParameter(TypedDict, total=False):
    """Generic/template type parameter."""

    name: str
    constraint: NotRequired[TypeReference]
    default: NotRequired[TypeReference]
    description: NotRequired[str]


class Signature(TypedDict, total=False):
    """Function/method signature."""

    parameters: NotRequired[List[Parameter]]
    returnType: NotRequired[TypeReference]
    typeParameters: NotRequired[List[TypeParameter]]


class Relation(TypedDict, total=False):
    """Typed relationship between DocItems."""

    kind: str  # Relationship type (container, extends, implements, etc.)
    target: str  # Target DocItem ID (language-native FQN)
    metadata: NotRequired[Dict[str, Any]]  # Relationship-specific metadata


# Relations type: map of relationship kinds to targets
# Values can be: str (simple reference), Relation (complex with metadata), or List[Relation]
Relations = Dict[str, Any]  # str | Relation | List[Relation] | List[str]


class DocItem(TypedDict, total=False):
    """Universal documentation item.

    Note: Language-specific fields like visibility, signature, isStatic, etc.
    should be placed in the metadata field, not as top-level properties.
    """

    id: str  # Language-native fully qualified name
    name: str
    kind: str
    language: str  # Source language
    location: NotRequired[Location]
    relations: NotRequired[Relations]  # Code relationships (container, extends, implements, etc.)
    docBlock: NotRequired[DocBlock]
    parent_id: NotRequired[str]  # Parent item ID (for establishing hierarchy)
    children: NotRequired[List["DocItem"]]
    metadata: NotRequired[Dict[str, Any]]  # Language-specific metadata (visibility, signature, etc.)
    ref: NotRequired[str]  # $ref


class Project(TypedDict, total=False):
    """Individual project in a documentation set."""

    id: str
    name: str
    description: NotRequired[str]
    language: str
    version: NotRequired[str]
    repository: NotRequired[Repository]  # Source repository information
    items: NotRequired[List[DocItem]]
    sourceRoot: NotRequired[str]
    metadata: NotRequired[Dict[str, Any]]
    ref: NotRequired[str]  # $ref


class DocSet(TypedDict, total=False):
    """Root documentation set (opendocs.json)."""

    id: str
    name: str
    description: NotRequired[str]
    version: str
    format: NotRequired[Literal["json"]]
    projects: List[Project]
    metadata: NotRequired[Metadata]


# Constants


class ItemKind:
    """Common item kinds."""

    # Containers
    MODULE = "module"
    NAMESPACE = "namespace"
    PACKAGE = "package"

    # Types
    CLASS = "class"
    INTERFACE = "interface"
    ENUM = "enum"
    STRUCT = "struct"
    TRAIT = "trait"
    TYPE_ALIAS = "typeAlias"

    # Members
    CONSTRUCTOR = "constructor"
    METHOD = "method"
    FUNCTION = "function"
    PROPERTY = "property"
    FIELD = "field"
    CONSTANT = "constant"
    VARIABLE = "variable"

    # Enum
    ENUM_MEMBER = "enumMember"

    # Other
    IMPORT = "import"
    EXPORT = "export"


class TagName:
    """Common tag names."""

    PARAM = "param"
    RETURNS = "returns"
    THROWS = "throws"
    DEPRECATED = "deprecated"
    SINCE = "since"
    VERSION = "version"
    EXAMPLE = "example"
    SEE = "see"
    LINK = "link"
    PUBLIC = "public"
    PRIVATE = "private"
    PROTECTED = "protected"
    INTERNAL = "internal"
    AUTHOR = "author"
    COPYRIGHT = "copyright"
    LICENSE = "license"
    TYPE = "type"
    TYPEDEF = "typedef"
    TEMPLATE = "template"
    GENERIC = "generic"


class Language:
    """Supported languages."""

    TYPESCRIPT = "typescript"
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    GO = "go"
    RUST = "rust"
    JAVA = "java"
    CSHARP = "csharp"
    CPP = "cpp"
    C = "c"
    RUBY = "ruby"
    PHP = "php"


class RelationKind:
    """Common relationship kinds used across languages."""

    # Universal relationships
    CONTAINER = "container"
    EXTENDS = "extends"
    IMPLEMENTS = "implements"

    # TypeScript/JavaScript
    TS_EXTENDS = "ts-extends"
    TS_IMPLEMENTS = "ts-implements"

    # Rust
    RUST_TRAIT_IMPL = "rust-trait-impl"
    RUST_SUPERTRAIT = "rust-supertrait"

    # Go
    GO_RECEIVER = "go-receiver"
    GO_EMBED = "go-embed"

    # Python
    PYTHON_DECORATOR = "python-decorator"
    PYTHON_METACLASS = "python-metaclass"

    # Java/C#
    JAVA_ANNOTATION = "java-annotation"
    JAVA_GENERIC_BOUND = "java-generic-bound"
