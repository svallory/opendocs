# OpenDocs Extractors

> Multi-language documentation extractors for the OpenDocs universal format

This monorepo contains OpenDocs extractors for multiple programming languages, enabling unified API documentation across different codebases.

## What is OpenDocs?

[OpenDocs](https://mint-tsdocs.saulo.engineer/opendocs.md) is a universal documentation interchange format designed to standardize how documentation is extracted, stored, and processed across different programming languages and documentation tools.

### Key Principles

- **Language Agnostic**: Works with any programming language
- **Template Friendly**: Designed for consumption by template engines
- **Scalable**: Handles projects from small libraries to massive monorepos
- **Extensible**: Supports language-specific metadata without breaking compatibility
- **Standard Based**: Uses established standards like JSON Schema and JSON $ref

## Projects

### Model Library

#### [@opendocs/model](./libs/opendocs-model)
TypeScript library providing the universal OpenDocs data model and utilities. This is the foundation used by all extractors.

**Features:**
- Five core models: DocSet, Project, DocItem, DocBlock, DocTag
- Type-safe TypeScript definitions
- Utility functions for working with OpenDocs data
- Language-agnostic design

### Extractors

#### [@opendocs/extractor-typescript](./apps/opendocs-extractor-typescript)
Extracts documentation from TypeScript and JavaScript projects using the TypeScript Compiler API.

**Supported:**
- Classes, interfaces, functions, enums, type aliases
- JSDoc comments
- Type annotations and signatures
- Visibility modifiers

**Usage:**
```bash
opendocs-extract-ts extract --config ./tsconfig.json --output ./docs/opendocs.json
```

#### [opendocs-extractor-python](./apps/opendocs-extractor-python)
Extracts documentation from Python projects using Python's AST module.

**Supported:**
- Classes, functions, methods
- Docstrings (Google, NumPy, Sphinx styles)
- Type annotations
- Async functions

**Usage:**
```bash
opendocs-extract-py extract --source ./src --output ./docs/opendocs.json
```

#### [opendocs-extractor-go](./apps/opendocs-extractor-go)
Extracts documentation from Go projects using Go's built-in AST and doc packages.

**Supported:**
- Structs, interfaces, type aliases
- Functions and methods
- Go doc comments
- Exported vs unexported declarations

**Usage:**
```bash
opendocs-extract-go extract --source ./pkg --output ./docs/opendocs.json
```

## OpenDocs Specification

The extractors follow the [OpenDocs specification](https://mint-tsdocs.saulo.engineer/opendocs.md):

- [Overview](https://mint-tsdocs.saulo.engineer/opendocs.md)
- [Design Principles](https://mint-tsdocs.saulo.engineer/opendocs/design-principles.md)
- [Data Model](https://mint-tsdocs.saulo.engineer/opendocs/opendocs-model.md)
- [File Organization](https://mint-tsdocs.saulo.engineer/opendocs/opendocs-file-organization.md)

## Output Format

All extractors generate an `opendocs.json` file with this structure:

```json
{
  "id": "my-project",
  "name": "My Project",
  "version": "0.1.0",
  "format": "json",
  "projects": [
    {
      "id": "my-lib",
      "name": "My Library",
      "language": "typescript",
      "version": "1.0.0",
      "items": [
        {
          "id": "MyClass",
          "name": "MyClass",
          "kind": "class",
          "docBlock": {
            "description": "...",
            "tags": [...]
          },
          "items": [...]
        }
      ]
    }
  ]
}
```

## Development

This monorepo uses [moon](https://moonrepo.dev) for task orchestration.

### Prerequisites

- Node.js 20.11.0
- Python 3.8+
- Go 1.21+
- [moon](https://moonrepo.dev/docs/install)

### Common Tasks

```bash
# Check all projects
moon check --all

# Build all projects
moon run :build

# Run tests
moon run :test

# Lint code
moon run :lint

# Format code
moon run :format

# Type check
moon run :typecheck
```

### Project-Specific Tasks

```bash
# Build TypeScript extractor
moon run opendocs-extractor-typescript:build

# Run Python extractor
moon run opendocs-extractor-python:dev

# Test Go extractor
moon run opendocs-extractor-go:test
```

## Architecture

```
opendocs/
├── libs/
│   └── opendocs-model/          # Shared TypeScript model library
│       ├── src/
│       │   ├── DocSet.ts        # Root documentation set
│       │   ├── Project.ts       # Project model
│       │   ├── DocItem.ts       # Universal doc item
│       │   ├── DocBlock.ts      # Documentation content
│       │   └── DocTag.ts        # Documentation tags
│       └── package.json
├── apps/
│   ├── opendocs-extractor-typescript/  # TypeScript extractor
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   └── extractor.ts
│   │   └── package.json
│   ├── opendocs-extractor-python/      # Python extractor
│   │   ├── opendocs_extractor/
│   │   │   ├── cli.py
│   │   │   └── extractor.py
│   │   └── pyproject.toml
│   └── opendocs-extractor-go/          # Go extractor
│       ├── cmd/opendocs-extract-go/
│       ├── internal/extractor/
│       └── go.mod
└── .moon/
    └── workspace.yml
```

## Roadmap

- [x] TypeScript/JavaScript extractor
- [x] Python extractor
- [x] Go extractor
- [ ] Rust extractor
- [ ] Java extractor
- [ ] C# extractor
- [ ] JSON Schema validation
- [ ] Documentation renderer/generator
- [ ] CI/CD integration examples

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## License

MIT © [Saulo Vallory](https://github.com/svallory)

## Related Projects

- [microsoft/api-extractor](https://github.com/microsoft/rushstack/tree/main/apps/api-extractor) - Inspiration for the TypeScript extractor
- [TypeDoc](https://typedoc.org/) - TypeScript documentation generator
- [Sphinx](https://www.sphinx-doc.org/) - Python documentation generator
- [godoc](https://pkg.go.dev/golang.org/x/tools/cmd/godoc) - Go documentation tool
