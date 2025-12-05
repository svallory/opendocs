# opendocs-model

> Python types for the OpenDocs universal documentation format

## Overview

This library provides type-safe Python classes using TypedDict for working with OpenDocs documentation. It implements the [OpenDocs specification](https://mint-tsdocs.saulo.engineer/opendocs.md)'s core models with full type hints.

## Installation

```bash
pip install opendocs-model
```

## Usage

```python
from datetime import datetime
from opendocs_model import (
    DocSet,
    Project,
    DocItem,
    DocBlock,
    DocTag,
    ItemKind,
    TagName,
    Language,
    VERSION,
)

# Create a DocSet
doc_set: DocSet = {
    "id": "my-docs",
    "name": "My Documentation",
    "version": VERSION,
    "format": "json",
    "projects": [],
    "metadata": {
        "created": datetime.now().isoformat(),
        "modified": datetime.now().isoformat(),
        "generator": {
            "name": "opendocs-extractor-python",
            "version": "0.1.0",
        },
    },
}

# Create a Project
project: Project = {
    "id": "my-package",
    "name": "My Package",
    "language": Language.PYTHON,
    "version": "1.0.0",
    "items": [],
}

# Create a DocItem
item: DocItem = {
    "id": "MyClass",
    "name": "MyClass",
    "kind": ItemKind.CLASS,
    "visibility": "public",
    "docBlock": {
        "description": "MyClass represents a custom data structure",
        "tags": [
            {
                "tag": TagName.SINCE,
                "content": "1.0.0",
            }
        ],
    },
    "items": [],
}

# Add items to project
project["items"] = [item]

# Add project to docSet
doc_set["projects"] = [project]

# Serialize to JSON
import json
with open("opendocs.json", "w") as f:
    json.dump(doc_set, f, indent=2)
```

## Core Types

All types are defined using `TypedDict` for maximum type safety and compatibility.

### DocSet
The root structure representing `opendocs.json`:
```python
class DocSet(TypedDict, total=False):
    id: str
    name: str
    description: NotRequired[str]
    version: str
    format: NotRequired[Literal["json"]]
    projects: List[Project]
    metadata: NotRequired[Metadata]
```

### Project
Individual project in a monorepo:
```python
class Project(TypedDict, total=False):
    id: str
    name: str
    description: NotRequired[str]
    language: str
    version: NotRequired[str]
    items: NotRequired[List[DocItem]]
    sourceRoot: NotRequired[str]
    metadata: NotRequired[Dict[str, Any]]
```

### DocItem
Universal documentation item:
```python
class DocItem(TypedDict, total=False):
    id: str
    name: str
    kind: str
    container: NotRequired[ContainerRef]
    docBlock: NotRequired[DocBlock]
    items: NotRequired[List[DocItem]]
    location: NotRequired[Location]
    visibility: NotRequired[Literal["public", "private", "protected", "internal"]]
    signature: NotRequired[Signature]
    type: NotRequired[TypeReference]
```

### DocBlock
Structured documentation content:
```python
class DocBlock(TypedDict, total=False):
    description: NotRequired[str]
    remarks: NotRequired[str]
    tags: NotRequired[List[DocTag]]
    examples: NotRequired[List[str]]
    deprecated: NotRequired[Deprecated]
    see: NotRequired[List[str]]
```

### DocTag
Documentation tag:
```python
class DocTag(TypedDict, total=False):
    tag: str
    content: NotRequired[str]
    name: NotRequired[str]
    type: NotRequired[str]
    metadata: NotRequired[Dict[str, Any]]
```

## Constants

### ItemKind
```python
class ItemKind:
    MODULE = "module"
    NAMESPACE = "namespace"
    PACKAGE = "package"
    CLASS = "class"
    INTERFACE = "interface"
    ENUM = "enum"
    STRUCT = "struct"
    FUNCTION = "function"
    METHOD = "method"
    # ... and more
```

### TagName
```python
class TagName:
    PARAM = "param"
    RETURNS = "returns"
    THROWS = "throws"
    DEPRECATED = "deprecated"
    EXAMPLE = "example"
    # ... and more
```

### Language
```python
class Language:
    TYPESCRIPT = "typescript"
    JAVASCRIPT = "javascript"
    PYTHON = "python"
    GO = "go"
    RUST = "rust"
    # ... and more
```

## Type Safety

This library uses modern Python typing features:

- `TypedDict` for structured dictionaries
- `NotRequired` for optional fields (Python 3.11+) or `typing_extensions`
- `Literal` types for restricted values
- Full type hints for all functions and classes

Works with type checkers like:
- mypy
- pyright
- pyre

## Design Principles

This library follows the OpenDocs design principles:

1. **Universal Abstraction**: Every element maps to a standardized structure
2. **Language-Specific Flexibility**: The `kind` field preserves language-specific typing
3. **Hierarchical Structure**: Supports monorepos with nested items
4. **Documentation Standardization**: Unified DocBlock structure
5. **Tag Flexibility**: Support for both simple and complex tags

## JSON Serialization

All types serialize cleanly to JSON:

```python
import json

# Serialize
with open("opendocs.json", "w") as f:
    json.dump(doc_set, f, indent=2)

# Deserialize
with open("opendocs.json", "r") as f:
    loaded: DocSet = json.load(f)
```

## License

MIT
