# opendocs-model-go

> Go types for the OpenDocs universal documentation format

## Overview

This library provides Go types and constants for working with OpenDocs documentation. It implements the [OpenDocs specification](https://mint-tsdocs.saulo.engineer/opendocs.md)'s core models in idiomatic Go.

## Installation

```bash
go get github.com/svallory/opendocs/libs/opendocs-model-go
```

## Usage

```go
import (
    model "github.com/svallory/opendocs/libs/opendocs-model-go"
    "encoding/json"
    "time"
)

// Create a DocSet
docSet := &model.DocSet{
    ID:      "my-docs",
    Name:    "My Documentation",
    Version: model.Version,
    Format:  "json",
    Projects: []model.Project{},
    Metadata: &model.Metadata{
        Created:  time.Now().Format(time.RFC3339),
        Modified: time.Now().Format(time.RFC3339),
        Generator: &model.Generator{
            Name:    "opendocs-extractor-go",
            Version: "0.1.0",
        },
    },
}

// Create a Project
project := model.Project{
    ID:       "my-package",
    Name:     "My Package",
    Language: model.LangGo,
    Version:  "1.0.0",
    Items:    []model.DocItem{},
}

// Create a DocItem
item := model.DocItem{
    ID:         "MyStruct",
    Name:       "MyStruct",
    Kind:       model.KindStruct,
    Visibility: "public",
    DocBlock: &model.DocBlock{
        Description: "MyStruct represents a custom data structure",
        Tags: []model.DocTag{
            {
                Tag:     model.TagSince,
                Content: "1.0.0",
            },
        },
    },
    Items: []model.DocItem{},
}

// Add items to project
project.Items = append(project.Items, item)

// Add project to docSet
docSet.Projects = append(docSet.Projects, project)

// Marshal to JSON
data, err := json.MarshalIndent(docSet, "", "  ")
if err != nil {
    panic(err)
}

// Write to file
os.WriteFile("opendocs.json", data, 0644)
```

## Core Types

### DocSet
The root structure representing `opendocs.json`:
```go
type DocSet struct {
    ID          string
    Name        string
    Description string
    Version     string
    Format      string
    Projects    []Project
    Metadata    *Metadata
}
```

### Project
Individual project in a monorepo:
```go
type Project struct {
    ID          string
    Name        string
    Description string
    Language    string
    Version     string
    Items       []DocItem
    SourceRoot  string
    Metadata    map[string]interface{}
}
```

### DocItem
Universal documentation item:
```go
type DocItem struct {
    ID         string
    Name       string
    Kind       string
    Container  *ContainerRef
    DocBlock   *DocBlock
    Items      []DocItem
    Location   *Location
    Visibility string
    Signature  *Signature
    Type       *TypeReference
}
```

### DocBlock
Structured documentation content:
```go
type DocBlock struct {
    Description string
    Remarks     string
    Tags        []DocTag
    Examples    []string
    Deprecated  *Deprecated
    See         []string
}
```

### DocTag
Documentation tag:
```go
type DocTag struct {
    Tag      string
    Content  string
    Name     string
    Type     string
    Metadata map[string]interface{}
}
```

## Constants

### Item Kinds
```go
const (
    KindModule    = "module"
    KindNamespace = "namespace"
    KindPackage   = "package"
    KindClass     = "class"
    KindInterface = "interface"
    KindEnum      = "enum"
    KindStruct    = "struct"
    KindFunction  = "function"
    KindMethod    = "method"
    // ... and more
)
```

### Tag Names
```go
const (
    TagParam      = "param"
    TagReturns    = "returns"
    TagThrows     = "throws"
    TagDeprecated = "deprecated"
    TagExample    = "example"
    // ... and more
)
```

### Languages
```go
const (
    LangTypeScript = "typescript"
    LangJavaScript = "javascript"
    LangPython     = "python"
    LangGo         = "go"
    LangRust       = "rust"
    // ... and more
)
```

## Design Principles

This library follows the OpenDocs design principles:

1. **Universal Abstraction**: Every element maps to a standardized structure
2. **Language-Specific Flexibility**: The `Kind` field preserves language-specific typing
3. **Hierarchical Structure**: Supports monorepos with nested items
4. **Documentation Standardization**: Unified DocBlock structure
5. **Tag Flexibility**: Support for both simple and complex tags

## JSON Serialization

All types include JSON struct tags for proper serialization:

```go
data, _ := json.MarshalIndent(docSet, "", "  ")
// Produces OpenDocs-compliant JSON
```

## License

MIT
