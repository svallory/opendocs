// Package model provides Go types for the OpenDocs universal documentation format.
//
// OpenDocs is a language-agnostic documentation interchange format that enables
// standardized documentation extraction across different programming languages.
package model

// Version is the OpenDocs specification version this library implements
const Version = "0.1.0"

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

// Repository contains repository information
type Repository struct {
	// Type of repository (e.g., "git")
	Type string `json:"type"`

	// URL of the repository
	URL string `json:"url"`

	// Directory within the repository
	Directory string `json:"directory,omitempty"`
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
	// ID is the unique identifier within the project
	ID string `json:"id"`

	// Name is the display name
	Name string `json:"name"`

	// Kind is the type of item (e.g., "class", "function", "method")
	Kind string `json:"kind"`

	// Container is a reference to the parent container
	Container *ContainerRef `json:"container,omitempty"`

	// DocBlock contains documentation content
	DocBlock *DocBlock `json:"docBlock,omitempty"`

	// Items contains child items
	Items []DocItem `json:"items,omitempty"`

	// Location contains source location information
	Location *Location `json:"location,omitempty"`

	// Visibility is the access level (public, private, protected, internal)
	Visibility string `json:"visibility,omitempty"`

	// IsStatic indicates if the item is static
	IsStatic bool `json:"isStatic,omitempty"`

	// IsAbstract indicates if the item is abstract
	IsAbstract bool `json:"isAbstract,omitempty"`

	// IsReadonly indicates if the item is readonly/const
	IsReadonly bool `json:"isReadonly,omitempty"`

	// Signature contains function/method signature information
	Signature *Signature `json:"signature,omitempty"`

	// Type contains type information for properties/variables
	Type *TypeReference `json:"type,omitempty"`

	// Metadata contains additional language-specific metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`

	// Ref is an optional JSON $ref for external file reference
	Ref string `json:"$ref,omitempty"`
}

// ContainerRef references a parent container (Project or DocItem)
type ContainerRef struct {
	// Type is either "project" or "item"
	Type string `json:"type"`

	// ID is the unique identifier of the container
	ID string `json:"id"`

	// Ref is an optional JSON $ref to the container's location
	Ref string `json:"$ref,omitempty"`
}

// DocBlock represents structured documentation content
type DocBlock struct {
	// Description is the main description/summary
	Description string `json:"description,omitempty"`

	// Remarks contains extended remarks or detailed description
	Remarks string `json:"remarks,omitempty"`

	// Tags contains documentation tags
	Tags []DocTag `json:"tags,omitempty"`

	// Examples contains code examples
	Examples []string `json:"examples,omitempty"`

	// Deprecated contains deprecation information
	Deprecated *Deprecated `json:"deprecated,omitempty"`

	// See contains links to related documentation
	See []string `json:"see,omitempty"`

	// Metadata contains additional metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
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

// Location represents source location
type Location struct {
	// File is the source file path
	File string `json:"file"`

	// Line is the line number
	Line int `json:"line,omitempty"`

	// Column is the column number
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
