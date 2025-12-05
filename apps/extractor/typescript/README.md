# @opendocs/extractor-typescript

> OpenDocs extractor for TypeScript/JavaScript projects

## Overview

Extracts API documentation from TypeScript and JavaScript source files and converts it to the [OpenDocs](https://mint-tsdocs.saulo.engineer/opendocs.md) universal format. This extractor uses the TypeScript Compiler API to analyze source code and JSDoc comments.

## Installation

```bash
npm install -g @opendocs/extractor-typescript
```

## Usage

### CLI

```bash
# Extract from current directory
opendocs-extract-ts extract

# Specify tsconfig location
opendocs-extract-ts extract --config ./tsconfig.json

# Specify output location
opendocs-extract-ts extract --output ./docs/opendocs.json

# Set project name and ID
opendocs-extract-ts extract --project-name "My Library" --project-id "my-lib"
```

### Programmatic API

```typescript
import { extractDocumentation } from '@opendocs/extractor-typescript';

const docSet = await extractDocumentation({
  tsconfigPath: './tsconfig.json',
  projectName: 'My Library',
  projectId: 'my-lib',
});

console.log(JSON.stringify(docSet, null, 2));
```

## Features

- ✓ Extracts classes, interfaces, functions, enums, and type aliases
- ✓ Preserves JSDoc comments as DocBlocks
- ✓ Extracts method signatures, parameters, and return types
- ✓ Supports visibility modifiers (public, private, protected)
- ✓ Handles static and readonly modifiers
- ✓ Extracts source location information

## Supported Elements

- **Classes**: Including constructors, methods, and properties
- **Interfaces**: With property signatures
- **Functions**: With parameters and return types
- **Enums**: With enum members
- **Type Aliases**: With type definitions

## Output Format

Generates an `opendocs.json` file following the OpenDocs specification:

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
      "items": [...]
    }
  ]
}
```

## Dependencies

- Uses `@opendocs/model` for the universal documentation model
- Built on the TypeScript Compiler API
- Uses `commander` for CLI parsing

## License

MIT
