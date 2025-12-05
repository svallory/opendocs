# OpenDocs Extractor Test Sandbox

This directory contains sample libraries in different languages for testing the OpenDocs extractors.

## Testing the Extractors

### TypeScript Extractor

```bash
cd sandbox/typescript
node ../../apps/extractor/typescript/lib/cli.js extract -t tsconfig.json -o opendocs.json
```

### Go Extractor

```bash
cd sandbox/go
../../apps/extractor/go/opendocs-extract-go extract -s . -o opendocs.json
```

### Python Extractor

```bash
cd sandbox/python
python3 -m opendocs_extractor extract -s . -o opendocs.json
```

## Test Library Contents

Each test library contains similar constructs to verify the extractors work correctly:

- **Classes**: `Calculator` class with methods and properties
- **Functions**: Standalone functions like `greet()` and `formatCurrency()`
- **Interfaces/Types**: Configuration interfaces and type aliases
- **Enumerations**: `LogLevel` enum
- **Documentation**: JSDoc/docstring comments with parameters, return types, and descriptions

The extractors should produce equivalent OpenDocs output for each language.
