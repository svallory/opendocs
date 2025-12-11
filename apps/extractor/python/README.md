# opendocs-extractor-python

> OpenDocs extractor for Python projects

## Overview

Extracts API documentation from Python source files and converts it to the [OpenDocs](https://mint-tsdocs.saulo.engineer/opendocs.md) universal format. This extractor uses Python's AST (Abstract Syntax Tree) module to analyze source code and docstrings.

## Installation

```bash
pip install opendocs-extractor-python
```

## Usage

### CLI

```bash
# Extract from current directory
opendocs-extract-py extract

# Specify source directory
opendocs-extract-py extract --source ./src

# Specify output location
opendocs-extract-py extract --output ./docs/opendocs.json

# Set project metadata
opendocs-extract-py extract \
  --project-name "My Library" \
  --project-id "my-lib" \
  --project-version "1.0.0"
```

### Programmatic API

```python
from pathlib import Path
from opendocs_extractor import extract_documentation

doc_set = extract_documentation(
    source_dir=Path("./src"),
    project_name="My Library",
    project_id="my-lib",
    project_version="1.0.0"
)

print(doc_set)
```

## Features

- ✓ Extracts classes, methods, and functions
- ✓ Parses docstrings (Google, NumPy, Sphinx styles)
- ✓ Extracts type annotations
- ✓ Supports async functions
- ✓ Handles visibility based on naming conventions
- ✓ Extracts source location information

## Supported Elements

- **Classes**: Including methods and nested classes
- **Functions**: Module-level functions with parameters and return types
- **Methods**: Including `__init__` (constructors) and regular methods
- **Async Functions**: Both async functions and async methods

## Docstring Parsing

Supports multiple docstring formats:

### Google Style
```python
def function(arg1: str, arg2: int) -> bool:
    """Summary line.

    Extended description.

    Args:
        arg1: Description of arg1
        arg2: Description of arg2

    Returns:
        Description of return value

    Raises:
        ValueError: When something goes wrong
    """
    pass
```

### NumPy Style
```python
def function(arg1, arg2):
    """
    Summary line.

    Extended description.

    Parameters
    ----------
    arg1 : str
        Description of arg1
    arg2 : int
        Description of arg2

    Returns
    -------
    bool
        Description of return value
    """
    pass
```

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
      "language": "python",
      "version": "1.0.0",
      "items": [...]
    }
  ]
}
```

## Dependencies

- `click`: For CLI interface
- `docstring-parser`: For parsing different docstring formats

## Development

```bash
# Install with dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black .

# Type checking
mypy opendocs_extractor
```

## License

MIT
