# @opendocs/model

> Universal documentation model for OpenDocs - language-agnostic API documentation representation

## Overview

`@opendocs/model` provides TypeScript types and utilities for working with OpenDocs documentation. It implements the [OpenDocs specification](https://mint-tsdocs.saulo.engineer/opendocs.md)'s five core models that enable language-agnostic documentation extraction and processing.

## Core Models

### DocSet

The root object representing `opendocs.json` - the entry point for your Documentation Set.

```typescript
import { DocSet, DocSetUtils } from '@opendocs/model';

const docSet: DocSet = DocSetUtils.create({
  id: 'my-docs',
  name: 'My Documentation',
  description: 'API documentation for my project',
  generator: {
    name: 'opendocs-extractor-typescript',
    version: '0.1.0',
  },
});
```

### Project

Represents an individual project (package, library, app) within a Documentation Set.

```typescript
import { Project, SupportedLanguages } from '@opendocs/model';

const project: Project = {
  id: 'my-package',
  name: 'My Package',
  language: SupportedLanguages.TYPESCRIPT,
  version: '1.0.0',
  items: [],
};
```

### DocItem

The universal element representing any documentable code (classes, functions, methods, etc.).

```typescript
import { DocItem, ItemKind } from '@opendocs/model';

const classItem: DocItem = {
  id: 'MyClass',
  name: 'MyClass',
  kind: ItemKind.CLASS,
  visibility: 'public',
  items: [], // child items (methods, properties)
};
```

### DocBlock

Structured documentation content extracted from code comments.

```typescript
import { DocBlock } from '@opendocs/model';

const docBlock: DocBlock = {
  description: 'Main description of the element',
  remarks: 'Extended documentation',
  tags: [
    {
      tag: 'param',
      name: 'value',
      type: 'string',
      content: 'The value to process',
    },
    {
      tag: 'returns',
      type: 'boolean',
      content: 'True if successful',
    },
  ],
};
```

### DocTag

Individual documentation tags (`@param`, `@returns`, `@deprecated`, etc.).

```typescript
import { DocTag, CommonTags } from '@opendocs/model';

const paramTag: DocTag = {
  tag: CommonTags.PARAM,
  name: 'value',
  type: 'string',
  content: 'The value to process',
};
```

## Design Principles

OpenDocs follows five fundamental design principles:

1. **Universal Abstraction**: Every element maps to a standardized DocItem
2. **Language-Specific Flexibility**: The `kind` field preserves language-specific typing
3. **Hierarchical Structure**: Supports monorepos with nested projects and items
4. **Documentation Standardization**: Unified DocBlock structure across all formats
5. **Tag Flexibility**: Support for both simple and complex tags with custom extensions

## Utilities

Each model comes with utility functions for common operations:

```typescript
import {
  DocSetUtils,
  ProjectUtils,
  DocItemUtils,
  DocBlockUtils,
  ContainerRefUtils,
} from '@opendocs/model';

// Find a project
const project = DocSetUtils.findProjectById(docSet, 'my-package');

// Find an item in a project
const item = ProjectUtils.findItemById(project, 'MyClass');

// Check if item is a container
const isContainer = DocItemUtils.isContainer(item);

// Find tags
const paramTags = DocBlockUtils.getParamTags(docBlock);
```

## Usage with Extractors

This library is designed to be used by OpenDocs extractors for different languages:

- `@opendocs/extractor-typescript` - TypeScript/JavaScript extractor
- `@opendocs/extractor-python` - Python extractor
- `@opendocs/extractor-go` - Go extractor

Each extractor uses this model to generate OpenDocs-compliant JSON output.

## License

MIT
