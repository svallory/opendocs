# OpenDocs Model - C

Pure C implementation of the OpenDocs data model.

## Overview

This library provides C structures and functions for representing documentation extracted from codebases. It follows the OpenDocs specification and mirrors the TypeScript reference implementation.

## Features

- Pure C11 implementation
- Zero dependencies (except for JSON serialization)
- Manual memory management with cleanup functions
- Language-native ID format: `file.h::function_name`, `file.h::struct_name`

## Types

The library implements six core types:

- `opendocs_docset_t` - Root container for entire documentation set
- `opendocs_project_t` - Represents a single project
- `opendocs_doc_item_t` - A documented code element
- `opendocs_doc_block_t` - Documentation comments
- `opendocs_doc_tag_t` - Individual tags (@param, @returns, etc.)
- `opendocs_relation_t` - Relationships between items

## Building

```bash
# Using moon
moon run model-c:build

# Using CMake directly
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build .
```

## Usage

```c
#include <opendocs/model/types.h>

// Create a doc item
opendocs_doc_item_t *item = calloc(1, sizeof(opendocs_doc_item_t));
item->id = strdup("my_function");
item->name = strdup("my_function");
item->kind = OPENDOCS_KIND_FUNCTION;

// Don't forget to free when done
opendocs_doc_item_free(item);
```

## Memory Management

All structures must be manually freed using the provided cleanup functions:

- `opendocs_docset_free()`
- `opendocs_project_free()`
- `opendocs_doc_item_free()`

## TODO

- [ ] Implement JSON serialization using cJSON
- [ ] Add unit tests
- [ ] Add validation functions
