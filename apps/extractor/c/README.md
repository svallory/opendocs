# OpenDocs Extractor - C

Documentation extractor for C codebases.

## Overview

Command-line tool that parses C source files and generates OpenDocs JSON documentation. Extracts functions, structs, typedefs, enums, macros, and their associated documentation comments.

## Features

- Extracts C documentation from source files
- Supports Doxygen-style comments (@param, @return, @brief, etc.)
- Language-native IDs: `file.h::function_name`, `file.h::struct_name`
- Outputs standard `opendocs.json` format

## Building

```bash
# Using moon
moon run extractor-c:build

# Using CMake directly
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

## Usage

```bash
# Extract documentation from C files
opendocs-extract-c -p mylib -v 1.0.0 -o opendocs.json src/*.c include/*.h

# Options:
#   -p, --project NAME   Project name (required)
#   -v, --version VER    Project version (default: 0.1.0)
#   -o, --output FILE    Output file (default: opendocs.json)
#   -h, --help           Show help
```

## Example

Given a C header file:

```c
/**
 * @brief Adds two numbers
 * @param a First number
 * @param b Second number
 * @return Sum of a and b
 */
int add(int a, int b);
```

Produces:

```json
{
  "id": "mylib",
  "name": "mylib",
  "version": "1.0.0",
  "projects": [{
    "language": "c",
    "items": [{
      "id": "add",
      "name": "add",
      "kind": "function",
      "docBlock": {
        "summary": "Adds two numbers",
        "tags": [
          {"name": "@param", "value": "a First number"},
          {"name": "@param", "value": "b Second number"},
          {"name": "@return", "value": "Sum of a and b"}
        ]
      }
    }]
  }]
}
```

## Implementation Status

⚠️ **Currently a stub implementation**. The extractor needs:

- [ ] libclang integration for parsing
- [ ] AST traversal implementation
- [ ] Documentation comment extraction
- [ ] JSON output generation
- [ ] Unit tests

## Dependencies

- CMake 3.15+
- C11 compiler
- libclang (for parsing)

## Testing

Use the sandbox project for testing:

```bash
cd sandbox/c
../../apps/extractor/c/build/bin/opendocs-extract-c -p calculator -v 1.0.0 include/*.h src/*.c
```
