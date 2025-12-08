// Package model provides Go types for the OpenDocs universal documentation format.
//
// OpenDocs is a language-agnostic documentation interchange format that enables
// standardized documentation extraction across different programming languages.
package model

// Version is the OpenDocs specification version this library implements
const Version = "0.2.0"

// DocSet represents the root OpenDocs structure (opendocs.json file).
// It contains metadata about the documentation and references to all projects.
type DocSet struct {
	// ID is the documentation set identifier
	ID string `json:"id"`

	// Name is the human-readable documentation name
	Name string `json:"name"`

	// Description is an optional description of the documentation set
	Description string `json:"description,omitempty"`

	// Version is the OpenDocs specification version
	Version string `json:"version"`

	// Format indicates the documentation format (currently only "json")
	Format string `json:"format,omitempty"`

	// Projects contains all projects in this documentation set
	Projects []Project `json:"projects"`

	// Metadata contains additional documentation set metadata
	Metadata *Metadata `json:"metadata,omitempty"`
}

// Metadata contains metadata about the documentation set
type Metadata struct {
	// Created timestamp (RFC3339 format)
	Created string `json:"created,omitempty"`

	// Modified timestamp (RFC3339 format)
	Modified string `json:"modified,omitempty"`

	// Generator information
	Generator *Generator `json:"generator,omitempty"`

	// Repository information
	Repository *Repository `json:"repository,omitempty"`

	// Additional custom metadata
	Extra map[string]interface{} `json:"-"`
}

// Generator contains information about the tool that generated the documentation
type Generator struct {
	// Name of the generator tool
	Name string `json:"name"`

	// Version of the generator tool
	Version string `json:"version"`
}

// Repository contains source repository information for linking to source code
type Repository struct {
	// Type of repository (e.g., "git", "svn", "mercurial")
	Type string `json:"type"`

	// URL of the repository
	URL string `json:"url"`

	// FileURLTemplate is a template for generating file URLs
	// Supported placeholders: {repo}, {hash}, {path}, {line}
	// Example: "{repo}/blob/{hash}/{path}#L{line}"
	FileURLTemplate string `json:"fileUrlTemplate,omitempty"`
}

// Project represents an individual project within a Documentation Set.
// In monorepos, each package, library, or app is a separate Project.
type Project struct {
	// ID is the unique project identifier
	ID string `json:"id"`

	// Name is the human-readable project name
	Name string `json:"name"`

	// Description is an optional project description
	Description string `json:"description,omitempty"`

	// Language is the programming language
	Language string `json:"language"`

	// Version is the project version
	Version string `json:"version,omitempty"`

	// Repository contains source repository information
	Repository *Repository `json:"repository,omitempty"`

	// Items contains top-level documentation items
	Items []DocItem `json:"items,omitempty"`

	// SourceRoot is the source root directory
	SourceRoot string `json:"sourceRoot,omitempty"`

	// Metadata contains project metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`

	// Ref is an optional JSON $ref for external file reference
	Ref string `json:"$ref,omitempty"`
}

// DocItem represents the universal documentation item.
// Every documentable code element is represented as a DocItem.
type DocItem struct {
	// ID is the language-native fully qualified name
	// Examples: package#Symbol (TypeScript), crate::Type (Rust), package.Function (Go)
	ID string `json:"id"`

	// Name is the display name
	Name string `json:"name"`

	// Kind is the type of item (e.g., "class", "function", "method")
	Kind string `json:"kind"`

	// Language is the source language
	Language string `json:"language"`

	// Location contains source code location
	Location *Location `json:"location,omitempty"`

	// Relations contains code relationships (container, extends, implements, etc.)
	Relations Relations `json:"relations,omitempty"`

	// DocBlock contains documentation content
	DocBlock *DocBlock `json:"docBlock,omitempty"`

	// ParentID is the parent item ID (for establishing hierarchy)
	ParentID *string `json:"parentId,omitempty"`

	// Children contains child items
	Children []DocItem `json:"children,omitempty"`

	// Signature contains function/method signature information
	// Per specification, language-specific fields like visibility, isStatic, isAbstract, isReadonly
	// should be placed in the metadata field, not as top-level properties
	Signature *Signature `json:"signature,omitempty"`

	// Type contains type information for properties/variables
	Type *TypeReference `json:"type,omitempty"`

	// Metadata contains additional language-specific metadata
	// Examples: visibility, isStatic, isAbstract, isReadonly, decorators, receiver, etc.
	Metadata map[string]interface{} `json:"metadata,omitempty"`

	// Ref is an optional JSON $ref for external file reference
	Ref string `json:"$ref,omitempty"`
}

// Relation represents a typed relationship between DocItems
type Relation struct {
	// Kind is the relationship type (container, extends, implements, etc.)
	Kind string `json:"kind"`

	// Target is the target DocItem ID (language-native FQN)
	Target string `json:"target"`

	// Metadata contains relationship-specific metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// Relations is a map of relationship kinds to their targets
// Values can be: string (simple reference), Relation (complex), or []interface{} (multiple)
type Relations map[string]interface{}

// DocBlock represents structured documentation content extracted from code comments.
// Per the OpenDocs specification, it contains main content and tags for structured metadata.
type DocBlock struct {
	// Content is the main description/summary. Supports Markdown formatting.
	Content string `json:"content,omitempty"`

	// Tags contains documentation tags organized by tag name.
	// Format: Record<string, (string | DocTag)[]>
	// Each key is a tag name, value is an array of either strings or DocTag objects.
	// Common tags: param, returns, throws, since, deprecated, example, see, etc.
	Tags map[string][]interface{} `json:"tags,omitempty"`
}

// DocTag represents a documentation tag
type DocTag struct {
	// Tag is the tag name (without @)
	Tag string `json:"tag"`

	// Content is the tag content/description
	Content string `json:"content,omitempty"`

	// Name is an optional parameter name (for @param, @throws, etc.)
	Name string `json:"name,omitempty"`

	// Type is optional type information
	Type string `json:"type,omitempty"`

	// Metadata contains additional tag-specific metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// Deprecated contains deprecation information
type Deprecated struct {
	// Message is the deprecation message
	Message string `json:"message,omitempty"`

	// Since indicates when the item was deprecated
	Since string `json:"since,omitempty"`

	// Alternative suggests an alternative
	Alternative string `json:"alternative,omitempty"`
}

// Location represents source code location
type Location struct {
	// Path is the file path (relative to project root)
	Path string `json:"path"`

	// Number is the line number (1-indexed)
	Number int `json:"number"`

	// Column is the column number (1-indexed)
	Column int `json:"column,omitempty"`
}

// Signature represents a function/method signature
type Signature struct {
	// Parameters contains function parameters
	Parameters []Parameter `json:"parameters,omitempty"`

	// ReturnType is the return type
	ReturnType *TypeReference `json:"returnType,omitempty"`

	// TypeParameters contains generic/template parameters
	TypeParameters []TypeParameter `json:"typeParameters,omitempty"`
}

// Parameter represents a function parameter
type Parameter struct {
	// Name is the parameter name
	Name string `json:"name"`

	// Type is the parameter type
	Type *TypeReference `json:"type,omitempty"`

	// IsOptional indicates if the parameter is optional
	IsOptional bool `json:"isOptional,omitempty"`

	// IsRest indicates if this is a rest parameter
	IsRest bool `json:"isRest,omitempty"`

	// DefaultValue is the default value as string
	DefaultValue string `json:"defaultValue,omitempty"`

	// Description is the parameter description
	Description string `json:"description,omitempty"`
}

// TypeParameter represents a generic/template parameter
type TypeParameter struct {
	// Name is the type parameter name
	Name string `json:"name"`

	// Constraint is the constraint type
	Constraint *TypeReference `json:"constraint,omitempty"`

	// Default is the default type
	Default *TypeReference `json:"default,omitempty"`

	// Description is the type parameter description
	Description string `json:"description,omitempty"`
}

// TypeReference represents a type reference
type TypeReference struct {
	// Name is the type name or expression
	Name string `json:"name"`

	// Ref is an optional reference to the type definition
	Ref string `json:"$ref,omitempty"`

	// TypeArguments contains type arguments for generic types
	TypeArguments []TypeReference `json:"typeArguments,omitempty"`

	// IsUnion indicates if this is a union type
	IsUnion bool `json:"isUnion,omitempty"`

	// IsIntersection indicates if this is an intersection type
	IsIntersection bool `json:"isIntersection,omitempty"`

	// IsArray indicates if this is an array type
	IsArray bool `json:"isArray,omitempty"`

	// IsPromise indicates if this is a promise/future type
	IsPromise bool `json:"isPromise,omitempty"`

	// IsNullable indicates if this is a nullable type
	IsNullable bool `json:"isNullable,omitempty"`
}

// Common item kinds
const (
	// Containers
	KindModule    = "module"
	KindNamespace = "namespace"
	KindPackage   = "package"

	// Types
	KindClass     = "class"
	KindInterface = "interface"
	KindEnum      = "enum"
	KindStruct    = "struct"
	KindTrait     = "trait"
	KindTypeAlias = "typeAlias"

	// Members
	KindConstructor = "constructor"
	KindMethod      = "method"
	KindFunction    = "function"
	KindProperty    = "property"
	KindField       = "field"
	KindConstant    = "constant"
	KindVariable    = "variable"

	// Enum
	KindEnumMember = "enumMember"

	// Other
	KindImport = "import"
	KindExport = "export"
)

// Common tag names
const (
	TagParam      = "param"
	TagReturns    = "returns"
	TagThrows     = "throws"
	TagDeprecated = "deprecated"
	TagSince      = "since"
	TagVersion    = "version"
	TagExample    = "example"
	TagSee        = "see"
	TagLink       = "link"
	TagPublic     = "public"
	TagPrivate    = "private"
	TagProtected  = "protected"
	TagInternal   = "internal"
	TagAuthor     = "author"
	TagCopyright  = "copyright"
	TagLicense    = "license"
)

// Supported languages
const (
	LangTypeScript = "typescript"
	LangJavaScript = "javascript"
	LangPython     = "python"
	LangGo         = "go"
	LangRust       = "rust"
	LangJava       = "java"
	LangCSharp     = "csharp"
	LangCPP        = "cpp"
	LangC          = "c"
)

// Common relationship kinds
const (
	// Universal relationships
	RelationContainer  = "container"
	RelationExtends    = "extends"
	RelationImplements = "implements"

	// TypeScript/JavaScript
	RelationTSExtends    = "ts-extends"
	RelationTSImplements = "ts-implements"

	// Rust
	RelationRustTraitImpl   = "rust-trait-impl"
	RelationRustSupertrait  = "rust-supertrait"

	// Go
	RelationGoReceiver = "go-receiver"
	RelationGoEmbed    = "go-embed"

	// Python
	RelationPythonDecorator = "python-decorator"
	RelationPythonMetaclass = "python-metaclass"

	// Java/C#
	RelationJavaAnnotation   = "java-annotation"
	RelationJavaGenericBound = "java-generic-bound"
)
