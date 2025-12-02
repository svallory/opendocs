package extractor

import (
	"fmt"
	"go/ast"
	"go/doc"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Options for the extractor
type Options struct {
	SourcePath     string
	ProjectName    string
	ProjectID      string
	ProjectVersion string
}

// DocSet represents the root OpenDocs structure
type DocSet struct {
	ID       string     `json:"id"`
	Name     string     `json:"name"`
	Version  string     `json:"version"`
	Format   string     `json:"format"`
	Projects []Project  `json:"projects"`
	Metadata *Metadata  `json:"metadata,omitempty"`
}

// Metadata for the DocSet
type Metadata struct {
	Created   string     `json:"created,omitempty"`
	Modified  string     `json:"modified,omitempty"`
	Generator *Generator `json:"generator,omitempty"`
}

// Generator information
type Generator struct {
	Name    string `json:"name"`
	Version string `json:"version"`
}

// Project represents a single project
type Project struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Language string    `json:"language"`
	Version  string    `json:"version,omitempty"`
	Items    []DocItem `json:"items,omitempty"`
}

// DocItem represents a documentation item
type DocItem struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Kind       string     `json:"kind"`
	Location   *Location  `json:"location,omitempty"`
	Visibility string     `json:"visibility,omitempty"`
	DocBlock   *DocBlock  `json:"docBlock,omitempty"`
	Signature  *Signature `json:"signature,omitempty"`
	Items      []DocItem  `json:"items,omitempty"`
}

// Location represents source location
type Location struct {
	File   string `json:"file"`
	Line   int    `json:"line"`
	Column int    `json:"column"`
}

// DocBlock represents documentation content
type DocBlock struct {
	Description string   `json:"description,omitempty"`
	Remarks     string   `json:"remarks,omitempty"`
	Tags        []DocTag `json:"tags,omitempty"`
}

// DocTag represents a documentation tag
type DocTag struct {
	Tag     string `json:"tag"`
	Name    string `json:"name,omitempty"`
	Type    string `json:"type,omitempty"`
	Content string `json:"content,omitempty"`
}

// Signature represents a function/method signature
type Signature struct {
	Parameters []Parameter    `json:"parameters,omitempty"`
	ReturnType *TypeReference `json:"returnType,omitempty"`
}

// Parameter represents a function parameter
type Parameter struct {
	Name string         `json:"name"`
	Type *TypeReference `json:"type,omitempty"`
}

// TypeReference represents a type
type TypeReference struct {
	Name string `json:"name"`
}

// ExtractDocumentation extracts OpenDocs from a Go project
func ExtractDocumentation(opts Options) (*DocSet, error) {
	// Get absolute path
	absPath, err := filepath.Abs(opts.SourcePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path: %w", err)
	}

	// Determine project name and ID
	projectName := opts.ProjectName
	projectID := opts.ProjectID
	if projectName == "" {
		projectName = filepath.Base(absPath)
	}
	if projectID == "" {
		projectID = filepath.Base(absPath)
	}

	// Create DocSet
	now := time.Now().Format(time.RFC3339)
	docSet := &DocSet{
		ID:      projectID,
		Name:    projectName,
		Version: "0.1.0",
		Format:  "json",
		Metadata: &Metadata{
			Created:  now,
			Modified: now,
			Generator: &Generator{
				Name:    "opendocs-extractor-go",
				Version: "0.1.0",
			},
		},
	}

	// Create Project
	project := Project{
		ID:       projectID,
		Name:     projectName,
		Language: "go",
		Version:  opts.ProjectVersion,
		Items:    []DocItem{},
	}

	// Parse Go packages
	fset := token.NewFileSet()
	pkgs, err := parser.ParseDir(fset, absPath, func(fi os.FileInfo) bool {
		// Skip test files
		return !strings.HasSuffix(fi.Name(), "_test.go")
	}, parser.ParseComments)

	if err != nil {
		return nil, fmt.Errorf("failed to parse Go packages: %w", err)
	}

	// Extract documentation from each package
	for pkgName, pkg := range pkgs {
		docPkg := doc.New(pkg, "./", doc.AllDecls)

		// Extract types
		for _, t := range docPkg.Types {
			item := extractType(t, fset, absPath)
			if item != nil {
				project.Items = append(project.Items, *item)
			}
		}

		// Extract functions
		for _, f := range docPkg.Funcs {
			item := extractFunc(f, fset, absPath)
			if item != nil {
				project.Items = append(project.Items, *item)
			}
		}

		_ = pkgName // Use pkgName if needed for package-level items
	}

	docSet.Projects = append(docSet.Projects, project)

	return docSet, nil
}

// extractType extracts a type declaration
func extractType(t *doc.Type, fset *token.FileSet, basePath string) *DocItem {
	item := &DocItem{
		ID:       t.Name,
		Name:     t.Name,
		Kind:     getTypeKind(t),
		DocBlock: extractDocBlock(t.Doc),
		Items:    []DocItem{},
	}

	// Extract location
	if t.Decl != nil {
		item.Location = getLocation(t.Decl.Pos(), fset, basePath)
	}

	// Extract methods
	for _, m := range t.Methods {
		method := extractFunc(m, fset, basePath)
		if method != nil {
			method.Kind = "method"
			item.Items = append(item.Items, *method)
		}
	}

	// Extract functions (constructors, etc.)
	for _, f := range t.Funcs {
		fn := extractFunc(f, fset, basePath)
		if fn != nil {
			item.Items = append(item.Items, *fn)
		}
	}

	return item
}

// extractFunc extracts a function declaration
func extractFunc(f *doc.Func, fset *token.FileSet, basePath string) *DocItem {
	item := &DocItem{
		ID:       f.Name,
		Name:     f.Name,
		Kind:     "function",
		DocBlock: extractDocBlock(f.Doc),
	}

	// Extract location
	if f.Decl != nil {
		item.Location = getLocation(f.Decl.Pos(), fset, basePath)

		// Extract signature
		if f.Decl.Type != nil {
			item.Signature = extractSignature(f.Decl.Type)
		}
	}

	// Determine visibility (exported vs unexported)
	if ast.IsExported(f.Name) {
		item.Visibility = "public"
	} else {
		item.Visibility = "private"
	}

	return item
}

// extractSignature extracts function signature
func extractSignature(funcType *ast.FuncType) *Signature {
	sig := &Signature{
		Parameters: []Parameter{},
	}

	// Extract parameters
	if funcType.Params != nil {
		for _, field := range funcType.Params.List {
			for _, name := range field.Names {
				param := Parameter{
					Name: name.Name,
				}
				if field.Type != nil {
					param.Type = &TypeReference{
						Name: formatType(field.Type),
					}
				}
				sig.Parameters = append(sig.Parameters, param)
			}
		}
	}

	// Extract return type
	if funcType.Results != nil && len(funcType.Results.List) > 0 {
		// For simplicity, just use the first return type
		// In real implementation, handle multiple return values
		result := funcType.Results.List[0]
		if result.Type != nil {
			sig.ReturnType = &TypeReference{
				Name: formatType(result.Type),
			}
		}
	}

	return sig
}

// extractDocBlock creates a DocBlock from doc comments
func extractDocBlock(docText string) *DocBlock {
	if docText == "" {
		return nil
	}

	return &DocBlock{
		Description: strings.TrimSpace(docText),
	}
}

// getLocation gets source location
func getLocation(pos token.Pos, fset *token.FileSet, basePath string) *Location {
	position := fset.Position(pos)
	relPath, _ := filepath.Rel(basePath, position.Filename)

	return &Location{
		File:   relPath,
		Line:   position.Line,
		Column: position.Column,
	}
}

// getTypeKind determines the kind of a type
func getTypeKind(t *doc.Type) string {
	if t.Decl == nil || t.Decl.Tok != token.TYPE {
		return "type"
	}

	for _, spec := range t.Decl.Specs {
		if typeSpec, ok := spec.(*ast.TypeSpec); ok {
			switch typeSpec.Type.(type) {
			case *ast.StructType:
				return "struct"
			case *ast.InterfaceType:
				return "interface"
			default:
				return "typeAlias"
			}
		}
	}

	return "type"
}

// formatType formats an AST type expression as a string
func formatType(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.Ident:
		return t.Name
	case *ast.StarExpr:
		return "*" + formatType(t.X)
	case *ast.ArrayType:
		return "[]" + formatType(t.Elt)
	case *ast.SelectorExpr:
		return formatType(t.X) + "." + t.Sel.Name
	default:
		return "unknown"
	}
}
