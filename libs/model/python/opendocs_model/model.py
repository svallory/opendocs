"""Core OpenDocs model types."""

from typing import Any, Dict, List, Literal, Optional, TypedDict
from typing_extensions import NotRequired

# Version
VERSION = "0.1.0"


class Generator(TypedDict, total=False):
    """Information about the documentation generator."""

    name: str
    version: str


class Repository(TypedDict, total=False):
    """Repository information."""

    type: str
    url: str
    directory: NotRequired[str]


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

    tag: str
    content: NotRequired[str]
    name: NotRequired[str]
    type: NotRequired[str]
    metadata: NotRequired[Dict[str, Any]]


class DocBlock(TypedDict, total=False):
    """Structured documentation content."""

    description: NotRequired[str]
    remarks: NotRequired[str]
    tags: NotRequired[List[DocTag]]
    examples: NotRequired[List[str]]
    deprecated: NotRequired[Deprecated]
    see: NotRequired[List[str]]
    metadata: NotRequired[Dict[str, Any]]


class Location(TypedDict, total=False):
    """Source code location."""

    file: str
    line: NotRequired[int]
    column: NotRequired[int]


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


class ContainerRef(TypedDict, total=False):
    """Reference to a parent container."""

    type: Literal["project", "item"]
    id: str
    ref: NotRequired[str]  # $ref


class DocItem(TypedDict, total=False):
    """Universal documentation item."""

    id: str
    name: str
    kind: str
    container: NotRequired[ContainerRef]
    docBlock: NotRequired[DocBlock]
    items: NotRequired[List["DocItem"]]
    location: NotRequired[Location]
    visibility: NotRequired[Literal["public", "private", "protected", "internal"]]
    isStatic: NotRequired[bool]
    isAbstract: NotRequired[bool]
    isReadonly: NotRequired[bool]
    signature: NotRequired[Signature]
    type: NotRequired[TypeReference]
    metadata: NotRequired[Dict[str, Any]]
    ref: NotRequired[str]  # $ref


class Project(TypedDict, total=False):
    """Individual project in a documentation set."""

    id: str
    name: str
    description: NotRequired[str]
    language: str
    version: NotRequired[str]
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
