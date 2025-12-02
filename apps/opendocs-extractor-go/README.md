# opendocs-extractor-go

> OpenDocs extractor for Go projects

## Overview

Extracts API documentation from Go source files and converts it to the [OpenDocs](https://mint-tsdocs.saulo.engineer/opendocs.md) universal format. This extractor uses Go's built-in `go/ast`, `go/parser`, and `go/doc` packages to analyze source code and documentation comments.

## Installation

```bash
go install github.com/svallory/opendocs/apps/opendocs-extractor-go/cmd/opendocs-extract-go@latest
```

## Usage

### CLI

```bash
# Extract from current directory
opendocs-extract-go extract

# Specify source directory
opendocs-extract-go extract --source ./pkg

# Specify output location
opendocs-extract-go extract --output ./docs/opendocs.json

# Set project metadata
opendocs-extract-go extract \
  --project-name "My Library" \
  --project-id "my-lib" \
  --project-version "1.0.0"
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/svallory/opendocs.git
cd opendocs/apps/opendocs-extractor-go

# Build
go build -o opendocs-extract-go ./cmd/opendocs-extract-go

# Run
./opendocs-extract-go extract --help
```

## Features

- ✓ Extracts types (structs, interfaces, type aliases)
- ✓ Extracts functions and methods
- ✓ Parses Go doc comments
- ✓ Handles exported vs unexported declarations
- ✓ Extracts function signatures with parameters and return types
- ✓ Extracts source location information

## Supported Elements

- **Structs**: Including methods and associated functions
- **Interfaces**: With method signatures
- **Functions**: Package-level functions with signatures
- **Methods**: Receiver methods for types
- **Type Aliases**: Custom type definitions

## Documentation Comments

Supports standard Go documentation comments:

```go
// Package mypackage provides utilities for data processing.
package mypackage

// User represents a user in the system.
// It contains basic user information and metadata.
type User struct {
    // Name is the user's display name
    Name string
    // Email is the user's email address
    Email string
}

// NewUser creates a new User instance with the given name and email.
// It validates the email format before creating the user.
func NewUser(name, email string) (*User, error) {
    // Implementation
    return &User{Name: name, Email: email}, nil
}

// GetFullName returns the user's full name.
// This method combines first and last names if available.
func (u *User) GetFullName() string {
    return u.Name
}
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
      "language": "go",
      "version": "1.0.0",
      "items": [...]
    }
  ]
}
```

## Dependencies

- `github.com/spf13/cobra`: For CLI interface
- `golang.org/x/tools`: For advanced Go tooling support

## Development

```bash
# Install dependencies
go mod download

# Run tests
go test ./...

# Format code
go fmt ./...

# Build
go build -o bin/opendocs-extract-go ./cmd/opendocs-extract-go
```

## License

MIT
