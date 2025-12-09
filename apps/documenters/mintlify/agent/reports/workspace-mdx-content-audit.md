# workspace.mdx Content Audit

**Purpose**: Document content from workspace.mdx before deletion

## Content Already in opendocs-file-organization.mdx ✓

1. **File organization strategies** (workspace.mdx lines 310-353)
   - Already in opendocs-file-organization.mdx lines 332-351
   - Content is similar/equivalent

2. **Best practices** (workspace.mdx lines 380-388)
   - Already in opendocs-file-organization.mdx lines 406-424
   - Content is similar/equivalent

3. **Migration examples** (workspace.mdx lines 410-463)
   - opendocs-file-organization.mdx lines 380-404 shows migration FROM workspace
   - This is correct - workspace is deprecated

## Unique Content in workspace.mdx (Needs Preservation)

### ID Conventions (workspace.mdx lines 389-408)

```markdown
### ID Conventions

```
Workspace IDs: lowercase-with-hyphens
Project IDs: lowercase-with-hyphens
Full References: workspace-id#project-id#item-id
```

Examples:
- Workspace: `acme-monorepo`
- Project: `user-service`
- Item: `acme-monorepo#user-service#UserController`
```

**Analysis**: This is useful information but references the deprecated "workspace" concept.
**Action**: Update to reflect documentation set structure and add to opendocs-file-organization.mdx

**Updated version**:
```markdown
### ID Conventions

```
Documentation Set IDs: lowercase-with-hyphens
Project IDs: lowercase-with-hyphens
Full References: project-id#item-id
```

Examples:
- Documentation Set: `acme-platform-docs`
- Project: `user-service`
- Item: `user-service#UserController`
- Nested Item: `user-service#UserController#login`
```

## Content to Discard (Deprecated Workspace Concept)

1. **DocumentationSet TypeTree with workspace** (lines 22-205)
   - Shows deprecated workspace structure
   - Should NOT be preserved

2. **Workspace Configuration** (lines 207-264)
   - Shows deprecated workspace examples
   - Should NOT be preserved

3. **Cross-Project References using workspace** (lines 355-378)
   - Example uses deprecated workspace structure
   - opendocs-file-organization.mdx has better examples

## Recommendation

**Add to opendocs-file-organization.mdx**:
- Updated ID conventions section (without workspace reference)

**Then delete workspace.mdx** - no other unique content needs preservation.
