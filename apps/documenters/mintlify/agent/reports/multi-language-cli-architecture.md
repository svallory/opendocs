# Multi-Language CLI Architecture Analysis

**Date**: 2025-12-08
**Topic**: Optimal language choice for universal opendocs-mintlify CLI
**Context**: Building a documentation generator that works with extractors written in different languages

## Problem Statement

Design a `opendocs-mintlify` CLI that can document software in **any language** for which there's an OpenDocs extractor, where each extractor is implemented in its native language:

- `opendocs-extract-typescript` (TypeScript/Bun)
- `opendocs-extract-python` (Python)
- `opendocs-extract-go` (Go)
- `opendocs-extract-rust` (Rust) - future
- etc.

## Architecture Overview

The CLI acts as a **coordinator/orchestrator** that:

1. Runs language-specific extractors as subprocesses
2. Reads the universal `opendocs.json` format
3. Generates Mintlify MDX documentation

```
opendocs-mintlify (coordinator)
    │
    ├─> Detects languages (tsconfig.json, *.py, go.mod, etc.)
    │
    ├─> Runs extractors as subprocesses:
    │   ├─> opendocs-extract-typescript (Bun/Node)
    │   ├─> opendocs-extract-python (Python)
    │   ├─> opendocs-extract-go (Go)
    │   └─> opendocs-extract-rust (Rust)
    │
    ├─> Reads opendocs.json (universal format)
    │
    └─> Renders Mintlify MDX
```

## Recommended Language: Go

### Advantages

#### 1. Single Binary Distribution ⭐ (Most Important)
- **No runtime dependencies** - Unlike Node.js or Python, Go compiles to a single static binary
- **Zero installation friction** - Users download one file and run it
- **Cross-platform by default** - Compile once for each OS (Linux, macOS, Windows)
- **No version conflicts** - No "works on my Node version" issues

#### 2. Excellent Subprocess Management
```go
// Run any extractor regardless of language
cmd := exec.Command("opendocs-extract-typescript", "extract", "--config", "...")
cmd := exec.Command("opendocs-extract-python", "extract", "...")
cmd := exec.Command("opendocs-extract-go", "extract", "...")

// Built-in streaming output, error handling, timeouts
```

#### 3. Fast Startup Time
- **Near-instant CLI startup** vs 100-500ms Node.js/Python overhead
- Critical for developer tools that run frequently
- Better developer experience

#### 4. Strong Standard Library
- File system operations
- JSON parsing/generation
- Template engines (`text/template`, `html/template`)
- HTTP client (for downloading extractors, checking updates)
- Cross-platform path handling

#### 5. Growing Ecosystem for Documentation Tools
- Hugo (static site generator) - Go
- Cobra (CLI framework) - Go
- Viper (configuration) - Go
- Many successful developer tools use Go

#### 6. Easy Distribution
- GitHub Releases with binaries for all platforms
- Homebrew, apt, yum, Chocolatey support
- Can embed templates/assets directly in the binary

### Example Implementation

```go
package main

import (
    "encoding/json"
    "os/exec"
    "path/filepath"
)

type Coordinator struct {
    projectRoot string
}

func (c *Coordinator) DetectLanguages() []string {
    var languages []string

    if fileExists(filepath.Join(c.projectRoot, "tsconfig.json")) {
        languages = append(languages, "typescript")
    }
    if fileExists(filepath.Join(c.projectRoot, "setup.py")) {
        languages = append(languages, "python")
    }
    if fileExists(filepath.Join(c.projectRoot, "go.mod")) {
        languages = append(languages, "go")
    }

    return languages
}

func (c *Coordinator) RunExtractor(language string) (*DocSet, error) {
    // Run language-specific extractor
    cmd := exec.Command(
        fmt.Sprintf("opendocs-extract-%s", language),
        "extract",
        "--output", "opendocs.json",
    )

    if err := cmd.Run(); err != nil {
        return nil, err
    }

    // Read universal opendocs.json
    var docSet DocSet
    data, _ := os.ReadFile("opendocs.json")
    json.Unmarshal(data, &docSet)

    return &docSet, nil
}

func (c *Coordinator) GenerateMintlifyDocs(docSet *DocSet) error {
    // Render templates to MDX
    // Update docs.json navigation
    return nil
}
```

## Alternative: TypeScript/Bun

### When TypeScript Makes Sense

TypeScript is a good choice if:

1. **Rapid iteration** is more important than distribution simplicity
2. **Target users already have Node.js** (common for web developers)
3. **Leverage existing template system** (LiquidJS is mature)
4. **Okay with npm/bunx installation** (`npm install -g opendocs-mintlify`)

### Advantages of TypeScript
- Existing implementation already works
- Rich ecosystem for templates (LiquidJS)
- Easier to find contributors (more TypeScript devs than Go devs)
- Faster development iteration
- Better IDE support for template editing

### Disadvantages
- Requires Node.js/Bun runtime installation
- Slower startup time (~100-500ms)
- Version management complexity (nvm, volta, etc.)
- Harder to distribute to non-Node users

## Hybrid Approach

Best of both worlds:

```
┌─────────────────────────────────────┐
│ opendocs-mintlify-go (Go binary)    │
│   - Single binary distribution      │
│   - Embeds Node.js runtime           │
│   - For universal adoption           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ opendocs-mintlify (TypeScript/Bun)  │
│   - For Node.js ecosystem users      │
│   - Faster development iteration     │
│   - Template system flexibility      │
└─────────────────────────────────────┘
```

Both use the same `opendocs.json` interface, so they can coexist.

## Decision Matrix

| Criteria | Go | TypeScript |
|----------|-----|------------|
| Single binary distribution | ✅ Excellent | ❌ Needs runtime |
| Startup performance | ✅ <10ms | ⚠️ 100-500ms |
| Cross-platform support | ✅ Built-in | ✅ Built-in |
| Subprocess management | ✅ stdlib | ✅ Node.js APIs |
| Template ecosystem | ⚠️ Go templates | ✅ LiquidJS |
| Developer familiarity | ⚠️ Less common | ✅ Very common |
| Existing codebase | ❌ Need rewrite | ✅ Already done |
| Target audience fit | ✅ All languages | ⚠️ Mainly web devs |
| Package distribution | ✅ Direct downloads | ⚠️ npm/bunx |
| Development speed | ⚠️ Slower initially | ✅ Fast iteration |

## Final Recommendation

### For Truly Universal CLI → **Go**

**Rationale**:
- Rust/Python/Java/C# developers don't have Node.js
- Single binary distribution significantly improves adoption
- Performance and startup time matter for CLI tools
- Better fit for multi-language ecosystem

### For Current Use Case → **Keep TypeScript**

**Rationale**:
- Already working and battle-tested
- Most users are TypeScript developers (have Node.js)
- Template system is mature and flexible
- Can migrate to Go later without breaking the opendocs.json interface

## Pragmatic Migration Path

**Phase 1**: Current (TypeScript implementation)
- Focus on battle-testing the OpenDocs format
- Iterate quickly on template system
- Build community around TypeScript users

**Phase 2**: Proof of concept (Go wrapper)
- Build minimal Go CLI that calls TypeScript implementation
- Test distribution model
- Gather feedback from non-Node users

**Phase 3**: Full Go implementation (if needed)
- Port template rendering to Go
- Maintain feature parity
- Keep TypeScript version as "development mode"

**Key Insight**: The `opendocs.json` format is the interface contract. The coordinator implementation can change independently of the extractors. This architectural separation allows you to switch languages later without breaking anything.

## Related Patterns

### Similar Tool Architectures

1. **Prettier** - JavaScript, but uses Rust parser
2. **ESLint** - JavaScript, calls various parsers
3. **Terraform** - Go, calls language-specific providers
4. **Docker** - Go, orchestrates containers
5. **Hugo** - Go, generates static sites

### Industry Trend

Most successful cross-language developer tools choose **Go** for the coordinator:
- Fast startup critical for DX
- Single binary removes installation friction
- Strong subprocess management
- Good enough template engines

## Conclusion

**Immediate**: Keep TypeScript implementation, focus on feature completeness

**Long-term**: Plan Go rewrite once multiple language extractors exist

**Hybrid**: Consider offering both - Go for universal adoption, TypeScript for rapid iteration

The universal `opendocs.json` format ensures the decision is **reversible** and **incremental**.
