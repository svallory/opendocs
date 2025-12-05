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

	model "github.com/svallory/opendocs/libs/model/go"
)

// extractionContext holds context during extraction
type extractionContext struct {
	packageName string
	currentType string
}

// Options for the extractor
type Options struct {
	SourcePath      string
	ProjectName     string
	ProjectID       string
	ProjectVersion  string
	RepoURL         string
	RepoType        string
	FileURLTemplate string
}

// ExtractDocumentation extracts OpenDocs from a Go project
func ExtractDocumentation(opts Options) (*model.DocSet, error) {
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
		// Use projectName as fallback before using directory name
		if projectName != "" {
			projectID = projectName
		} else {
			projectID = filepath.Base(absPath)
		}
	}

	// Create DocSet
	now := time.Now().Format(time.RFC3339)
	docSet := &model.DocSet{
		ID:      projectID,
		Name:    projectName,
		Version: model.Version,
		Format:  "json",
		Metadata: &model.Metadata{
			Created:  now,
			Modified: now,
			Generator: &model.Generator{
				Name:    "opendocs-extractor-go",
				Version: "0.2.0",
			},
		},
	}

	// Create Project
	project := model.Project{
		ID:       projectID,
		Name:     projectName,
		Language: model.LangGo,
		Version:  opts.ProjectVersion,
		Items:    []model.DocItem{},
	}

	// Add repository info if provided
	if opts.RepoURL != "" {
		repoType := opts.RepoType
		if repoType == "" {
			repoType = "git"
		}

		repo := model.Repository{
			Type:            repoType,
			URL:             opts.RepoURL,
			FileURLTemplate: opts.FileURLTemplate,
		}

		project.Repository = &repo
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

		// Create extraction context for this package
		ctx := extractionContext{
			packageName: pkgName,
		}

		// Extract types
		for _, t := range docPkg.Types {
			item := extractType(t, fset, absPath, ctx)
			if item != nil {
				project.Items = append(project.Items, *item)
			}
		}

		// Extract functions
		for _, f := range docPkg.Funcs {
			item := extractFunc(f, fset, absPath, ctx)
			if item != nil {
				project.Items = append(project.Items, *item)
			}
		}

		_ = pkgName // Use pkgName if needed for package-level items
	}

	docSet.Projects = append(docSet.Projects, project)

	return docSet, nil
}

// buildFQN builds a fully qualified name for a DocItem
func buildFQN(ctx extractionContext, itemName string) string {
	if ctx.currentType != "" {
		return fmt.Sprintf("%s.%s.%s", ctx.packageName, ctx.currentType, itemName)
	}
	return fmt.Sprintf("%s.%s", ctx.packageName, itemName)
}

// extractType extracts a type declaration
func extractType(t *doc.Type, fset *token.FileSet, basePath string, ctx extractionContext) *model.DocItem {
	fqn := buildFQN(ctx, t.Name)

	// Create a new context for nested items
	nestedCtx := extractionContext{
		packageName: ctx.packageName,
		currentType: t.Name,
	}

	item := &model.DocItem{
		ID:       fqn,
		Name:     t.Name,
		Kind:     getTypeKind(t),
		Language: model.LangGo,
		Relations: model.Relations{
			"container": ctx.packageName,
		},
		DocBlock: extractDocBlock(t.Doc),
		Items:    []model.DocItem{},
	}

	// Extract location
	if t.Decl != nil {
		item.Location = getLocation(t.Decl.Pos(), fset, basePath)
	}

	// Extract methods
	for _, m := range t.Methods {
		method := extractFunc(m, fset, basePath, nestedCtx)
		if method != nil {
			method.Kind = model.KindMethod
			item.Items = append(item.Items, *method)
		}
	}

	// Extract functions (constructors, etc.)
	for _, f := range t.Funcs {
		fn := extractFunc(f, fset, basePath, nestedCtx)
		if fn != nil {
			item.Items = append(item.Items, *fn)
		}
	}

	return item
}

// extractFunc extracts a function declaration
func extractFunc(f *doc.Func, fset *token.FileSet, basePath string, ctx extractionContext) *model.DocItem {
	fqn := buildFQN(ctx, f.Name)

	item := &model.DocItem{
		ID:       fqn,
		Name:     f.Name,
		Kind:     model.KindFunction,
		Language: model.LangGo,
		Relations: model.Relations{
			"container": ctx.packageName,
		},
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
func extractSignature(funcType *ast.FuncType) *model.Signature {
	sig := &model.Signature{
		Parameters: []model.Parameter{},
	}

	// Extract parameters
	if funcType.Params != nil {
		for _, field := range funcType.Params.List {
			for _, name := range field.Names {
				param := model.Parameter{
					Name: name.Name,
				}
				if field.Type != nil {
					param.Type = &model.TypeReference{
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
			sig.ReturnType = &model.TypeReference{
				Name: formatType(result.Type),
			}
		}
	}

	return sig
}

// extractDocBlock creates a DocBlock from doc comments
func extractDocBlock(docText string) *model.DocBlock {
	if docText == "" {
		return nil
	}

	return &model.DocBlock{
		Description: strings.TrimSpace(docText),
	}
}

// getLocation gets source location
func getLocation(pos token.Pos, fset *token.FileSet, basePath string) *model.Location {
	position := fset.Position(pos)
	relPath, _ := filepath.Rel(basePath, position.Filename)

	return &model.Location{
		Path:   relPath,
		Number: position.Line,
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
				return model.KindStruct
			case *ast.InterfaceType:
				return model.KindInterface
			default:
				return model.KindTypeAlias
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
