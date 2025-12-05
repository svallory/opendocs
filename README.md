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

### Model Libraries

Universal OpenDocs data models implemented in each language:

#### [TypeScript](./libs/model/typescript)
- Type-safe TypeScript definitions with utility functions
- Five core models: DocSet, Project, DocItem, DocBlock, DocTag
- `@opendocs/model` package

#### [Go](./libs/model/go)
- Pure Go types with JSON marshaling
- Zero external dependencies
- Constants for ItemKind, TagName, Language

#### [Python](./libs/model/python)
- TypedDict-based types for full type safety
- PEP 561 compliant (mypy, pyright, pyre)
- `opendocs-model` package

### Extractors

Language-specific documentation extractors:

#### [TypeScript Extractor](./apps/extractor/typescript)
Extracts from TypeScript/JavaScript using the TypeScript Compiler API.

**Supports:** Classes, interfaces, functions, enums, JSDoc comments, type annotations

```bash
opendocs-extract-ts extract --config ./tsconfig.json --output ./docs/opendocs.json
```

#### [Python Extractor](./apps/extractor/python)
Extracts from Python using AST module and docstring-parser.

**Supports:** Classes, functions, methods, docstrings (Google/NumPy/Sphinx), type annotations

```bash
opendocs-extract-py extract --source ./src --output ./docs/opendocs.json
```

#### [Go Extractor](./apps/extractor/go)
Extracts from Go using built-in ast/parser/doc packages.

**Supports:** Structs, interfaces, functions, methods, Go doc comments

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

Moon auto-discovers projects in the new structure:

```bash
# Build TypeScript extractor
moon run extractor-typescript:build

# Run Python extractor
moon run extractor-python:dev

# Test Go extractor
moon run extractor-go:test

# Build Go model library
moon run model-go:build
```

## Architecture

```
opendocs/
├── libs/
│   └── model/                   # OpenDocs model libraries
│       ├── typescript/          # TypeScript model (@opendocs/model)
│       │   ├── src/
│       │   │   ├── DocSet.ts
│       │   │   ├── Project.ts
│       │   │   ├── DocItem.ts
│       │   │   ├── DocBlock.ts
│       │   │   └── DocTag.ts
│       │   └── package.json
│       ├── go/                  # Go model
│       │   ├── model.go
│       │   └── go.mod
│       └── python/              # Python model (opendocs-model)
│           ├── opendocs_model/
│           │   ├── __init__.py
│           │   └── model.py
│           └── pyproject.toml
├── apps/
│   └── extractor/               # Language extractors
│       ├── typescript/          # TypeScript/JavaScript extractor
│       │   ├── src/
│       │   │   ├── cli.ts
│       │   │   └── extractor.ts
│       │   └── package.json
│       ├── python/              # Python extractor
│       │   ├── opendocs_extractor/
│       │   │   ├── cli.py
│       │   │   └── extractor.py
│       │   └── pyproject.toml
│       └── go/                  # Go extractor
│           ├── cmd/opendocs-extract-go/
│           ├── internal/extractor/
│           └── go.mod
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
