# OpenDocs Extractor - C++

Documentation extractor for C++ codebases.

## Overview

Command-line tool that parses C++ source files and generates OpenDocs JSON documentation. Extracts classes, templates, namespaces, functions, methods, and their associated documentation comments.

## Features

- Extracts C++ documentation from source files
- Supports Doxygen-style comments (@param, @return, @brief, @tparam, etc.)
- Handles modern C++ features (templates, namespaces, operator overloading)
- Language-native IDs: `namespace::ClassName`, `namespace::ClassName<T>::method`
- Uses libclang for robust parsing
- Outputs standard `opendocs.json` format

## Building

```bash
# Using moon
moon run extractor-cpp:build

# Using CMake directly
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

## Usage

```bash
# Extract documentation from C++ files
opendocs-extract-cpp -p mylib -v 1.0.0 -o opendocs.json include/**/*.hpp src/**/*.cpp

# Options:
#   -p, --project NAME   Project name (required)
#   -v, --version VER    Project version (default: 0.1.0)
#   -o, --output FILE    Output file (default: opendocs.json)
#   -h, --help           Show help
```

## Example

Given a C++ header file:

```cpp
namespace math {

/**
 * @brief A calculator class
 * @tparam T Numeric type
 */
template<typename T>
class Calculator {
public:
    /**
     * @brief Add two numbers
     * @param a First number
     * @param b Second number
     * @return Sum of a and b
     */
    T add(T a, T b);
};

} // namespace math
```

Produces:

```json
{
  "id": "mylib",
  "name": "mylib",
  "version": "1.0.0",
  "projects": [{
    "language": "cpp",
    "items": [{
      "id": "math::Calculator",
      "name": "Calculator",
      "kind": "class",
      "docBlock": {
        "summary": "A calculator class",
        "tags": [
          {"name": "@tparam", "value": "T Numeric type"}
        ]
      },
      "items": [{
        "id": "math::Calculator::add",
        "name": "add",
        "kind": "method",
        "docBlock": {
          "summary": "Add two numbers",
          "tags": [...]
        }
      }]
    }]
  }]
}
```

## Dependencies

- CMake 3.16+
- C++17 compiler
- LLVM/Clang libraries

## Testing

Use the sandbox project for testing:

```bash
cd sandbox/cpp
../../apps/extractor/cpp/build/bin/opendocs-extract-cpp -p calculator -v 1.0.0 include/*.hpp src/*.cpp
```

## Implementation Details

The extractor uses libclang to:
1. Parse C++ source files into an AST
2. Traverse the AST to find documented elements
3. Extract Doxygen-style comments
4. Build the OpenDocs data model
5. Serialize to JSON

Key components:
- `clang_parser.cpp` - libclang integration
- `doc_comment_parser.cpp` - Doxygen comment parsing
- `extractor.cpp` - Main extraction logic
- `main.cpp` - CLI interface
