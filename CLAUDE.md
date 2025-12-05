# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenDocs is a multi-language documentation extraction system that generates a universal documentation format (opendocs.json) from TypeScript, Python, and Go codebases. The monorepo contains:

- **Model libraries** (`libs/model/*`): Language-specific implementations of the OpenDocs data model (DocSet, Project, DocItem, DocBlock, DocTag)
- **Extractors** (`apps/extractor/*`): CLI tools that parse source code and generate opendocs.json files
- **Sandbox** (`sandbox/*`): Test files for validating extractors

## Build System: Moon

This monorepo uses [moon](https://moonrepo.dev) for task orchestration. Moon auto-discovers projects in `apps/`, `libs/`, and `packages/` directories.

### Common Commands

```bash
# Build all projects
moon run :build

# Run tests across all projects
moon run :test

# Lint all code
moon run :lint

# Format all code
moon run :format

# Type check all TypeScript projects
moon run :typecheck

# Check everything (equivalent to CI)
moon check --all
```

### Project-Specific Tasks

Moon uses the format `moon run <project-id>:<task>`. Project IDs follow the pattern `<directory>-<language>`:

```bash
# TypeScript extractor
moon run extractor-typescript:build
moon run extractor-typescript:dev

# Python extractor
moon run extractor-python:build
moon run extractor-python:dev
moon run extractor-python:test

# Go extractor
moon run extractor-go:build
moon run extractor-go:dev
moon run extractor-go:test
moon run extractor-go:fmt

# TypeScript model
moon run model-typescript:build

# Python model
moon run model-python:build

# Go model
moon run model-go:build
```

### Running Single Tests

Each language has its own test runner:

```bash
# TypeScript: use Jest directly
cd apps/extractor/typescript
jest path/to/test.spec.ts

# Python: use pytest directly
cd apps/extractor/python
pytest tests/test_specific.py::test_function_name

# Go: use go test directly
cd apps/extractor/go
go test ./internal/extractor -run TestSpecificFunction
```

## Architecture

### Directory Structure

```
opendocs/
├── apps/
│   └── extractor/          # CLI extractors for each language
│       ├── typescript/     # Uses TypeScript Compiler API
│       ├── python/         # Uses AST module + docstring-parser
│       └── go/             # Uses ast/parser/doc packages
├── libs/
│   └── model/              # OpenDocs data model implementations
│       ├── typescript/     # @opendocs/model package
│       ├── python/         # opendocs-model package
│       └── go/             # Pure Go types with JSON marshaling
└── sandbox/                # Test files for extractor validation
    ├── typescript/
    ├── python/
    └── go/
```

### Extractor Architecture

All extractors follow a similar pattern:
1. **CLI** (`cli.ts|py|go`): Command-line interface using commander/argparse/flag
2. **Extractor** (`extractor.ts|py|go`): Core logic that:
   - Parses source files using language-specific AST tools
   - Traverses AST to extract documentation elements
   - Converts to OpenDocs model format
   - Outputs `opendocs.json`

### Model Libraries

Each language implements the same six core types:
- `DocSet`: Root container for entire documentation set
- `Project`: Represents a single project with language, version, and repository info
- `DocItem`: A documented code element with language-native ID, source location, and relationships
- `DocBlock`: Documentation comments (description + tags)
- `DocTag`: Individual JSDoc/docstring tags (@param, @returns, etc.)
- `Relation`: Typed relationships between DocItems (container, extends, implements, etc.)

The TypeScript model is the source of truth; Python and Go implementations mirror its structure.

**Key features:**
- **Language-native IDs**: Each language uses its natural naming convention (e.g., `package#Symbol` for TypeScript, `crate::Type` for Rust)
- **Source locations**: File path, line number, and column for every DocItem
- **Repository links**: Project-level repository information with customizable URL templates
- **Flexible relationships**: Relations model supports simple strings, complex objects, and arrays

## OpenDocs Output Format

All extractors generate `opendocs.json` with this structure:

```json
{
  "id": "project-name",
  "name": "Project Name",
  "version": "1.0.0",
  "format": "json",
  "projects": [
    {
      "id": "subproject",
      "name": "Subproject",
      "language": "typescript|python|go",
      "version": "1.0.0",
      "items": [
        {
          "id": "MyClass",
          "name": "MyClass",
          "kind": "class|interface|function|method|...",
          "docBlock": {
            "description": "...",
            "tags": [
              { "name": "@param", "value": "paramName - description" }
            ]
          },
          "items": []  // nested items (methods, properties)
        }
      ]
    }
  ]
}
```

## Development Workflow

### Version Control

- Main branch: `main`
- Pre-commit hooks run `moon run :lint :format --affected --status=staged`
- Use conventional commits (feat:, fix:, docs:, etc.)

### Package Management

- Node.js: Uses pnpm (configured in `.moon/toolchain.base.yml`)
- Python: Standard pip/poetry workflows
- Go: Standard go modules

### TypeScript Configuration

Moon manages TypeScript project references automatically:
- `syncProjectReferences: true` keeps tsconfig.json files in sync
- `routeOutDirToCache: true` routes build outputs to `.moon/cache`
- `includeProjectReferenceSources: true` enables cross-project imports

When adding TypeScript dependencies between projects, moon automatically updates `tsconfig.json` references.

## Key Implementation Details

### TypeScript Extractor

- Uses `@microsoft/api-extractor` and TypeScript Compiler API
- Entry point: `apps/extractor/typescript/src/cli.ts`
- Main logic: `apps/extractor/typescript/src/extractor.ts`
- Requires `tsconfig.json` to identify project entry points
- Outputs to `lib/` when built

### Python Extractor

- Uses AST module for parsing and `docstring-parser` for docstrings
- Entry point: `apps/extractor/python/opendocs_extractor/cli.py`
- Main logic: `apps/extractor/python/opendocs_extractor/extractor.py`
- Supports Google, NumPy, and Sphinx docstring formats
- Runs as module: `python -m opendocs_extractor.cli`

### Go Extractor

- Uses built-in `go/ast`, `go/parser`, and `go/doc` packages
- Entry point: `apps/extractor/go/cmd/opendocs-extract-go/main.go`
- Main logic: `apps/extractor/go/internal/extractor/extractor.go`
- Builds to `bin/opendocs-extract-go`
- Supports standard Go doc comments

## Specification

The OpenDocs format specification lives at: https://mint-tsdocs.saulo.engineer/opendocs.md

When making changes to extractors or models, ensure compliance with:
- Data model schema: https://mint-tsdocs.saulo.engineer/opendocs/opendocs-model.md
- Design principles: https://mint-tsdocs.saulo.engineer/opendocs/design-principles.md
- File organization: https://mint-tsdocs.saulo.engineer/opendocs/opendocs-file-organization.md
