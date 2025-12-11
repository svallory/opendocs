# OpenDocs Model - C++

Modern C++ implementation of the OpenDocs data model.

## Overview

This library provides C++ classes and structures for representing documentation extracted from C++ codebases. It follows the OpenDocs specification and mirrors the TypeScript reference implementation.

## Features

- Modern C++17 implementation
- RAII-based memory management (smart pointers)
- Type-safe enums
- Standard library containers (vector, unordered_map, optional)
- Language-native ID format: `namespace::ClassName`, `namespace::ClassName<T>::method`

## Types

The library implements six core types:

- `DocSet` - Root container for entire documentation set
- `Project` - Represents a single project
- `DocItem` - A documented code element
- `DocBlock` - Documentation comments
- `DocTag` - Individual tags (@param, @returns, etc.)
- `Relation` - Relationships between items

## Building

```bash
# Using moon
moon run model-cpp:build

# Using CMake directly
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

## Usage

```cpp
#include <opendocs/model/types.hpp>

using namespace opendocs::model;

// Create a doc item
auto item = std::make_shared<DocItem>();
item->id = "MyClass";
item->name = "MyClass";
item->kind = ItemKind::CLASS;

// Automatic cleanup via smart pointers
```

## Memory Management

All structures use `std::shared_ptr` for automatic memory management. No manual cleanup required.

## TODO

- [ ] Add JSON serialization using nlohmann/json
- [ ] Add unit tests
- [ ] Add validation methods
- [ ] Add builder pattern for complex objects
