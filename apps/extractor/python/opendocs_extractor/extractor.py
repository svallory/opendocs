"""Python documentation extractor using AST."""

import ast
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

from docstring_parser import parse as parse_docstring
from opendocs_model import (
    DocSet,
    DocItem,
    DocBlock,
    DocTag,
    Parameter,
    Location,
    Language,
    ItemKind,
    TagName,
    VERSION,
    Repository,
)


@dataclass
class ExtractionContext:
    """Context for tracking FQN generation during extraction."""
    module_path: str              # e.g., "calculator"
    current_class: Optional[str] = None  # e.g., "Calculator"
    parent_ids: List[str] = None  # Stack of parent FQNs

    def __post_init__(self):
        if self.parent_ids is None:
            self.parent_ids = []


def get_module_path(file_path: Path, source_dir: Path) -> str:
    """Convert file path to module path (calculator.py → calculator)."""
    rel_path = file_path.relative_to(source_dir)

    if rel_path.name == "__init__.py":
        return str(rel_path.parent).replace("/", ".")

    return str(rel_path.with_suffix("")).replace("/", ".")


def build_fqn(module_path: str, class_name: Optional[str], item_name: str) -> str:
    """Build Python FQN: module.Class.method"""
    parts = [module_path]
    if class_name:
        parts.append(class_name)
    parts.append(item_name)
    return ".".join(parts)


def extract_documentation(
    source_dir: Path,
    project_name: Optional[str] = None,
    project_id: Optional[str] = None,
    project_version: Optional[str] = None,
    repo_url: Optional[str] = None,
    repo_type: Optional[str] = None,
    file_url_template: Optional[str] = None,
) -> DocSet:
    """
    Extract OpenDocs documentation from a Python project.

    Args:
        source_dir: Directory containing Python source files
        project_name: Optional project name
        project_id: Optional project ID
        project_version: Optional project version

    Returns:
        DocSet representing the OpenDocs documentation
    """
    # Create DocSet
    doc_set: DocSet = {
        "id": project_id or project_name or source_dir.name,
        "name": project_name or source_dir.name,
        "version": VERSION,
        "format": "json",
        "projects": [],
        "metadata": {
            "created": datetime.now().isoformat(),
            "modified": datetime.now().isoformat(),
            "generator": {
                "name": "opendocs-extractor-python",
                "version": "0.2.0",
            },
        },
    }

    # Create Project
    project: DocSet["projects"][0] = {  # type: ignore
        "id": project_id or project_name or source_dir.name,
        "name": project_name or source_dir.name,
        "language": Language.PYTHON,
        "version": project_version or get_project_version(source_dir),
        "items": [],
    }

    # Add repository info if provided
    if repo_url:
        project["repository"] = Repository(
            type=repo_type or "git",
            url=repo_url,
            fileUrlTemplate=file_url_template,
        )

    # Extract from Python files
    for py_file in source_dir.rglob("*.py"):
        if should_process_file(py_file, source_dir):
            items = extract_from_file(py_file, source_dir)
            project["items"].extend(items)

    doc_set["projects"].append(project)

    return doc_set


def should_process_file(file_path: Path, source_dir: Path) -> bool:
    """Check if a file should be processed."""
    # Skip test files, __pycache__, etc.
    parts = file_path.relative_to(source_dir).parts
    skip_patterns = ["test_", "__pycache__", ".venv", "venv", "build", "dist"]

    for part in parts:
        if any(pattern in str(part) for pattern in skip_patterns):
            return False

    return True


def extract_from_file(file_path: Path, source_dir: Path) -> List[DocItem]:
    """Extract documentation items from a Python file."""
    try:
        with file_path.open("r", encoding="utf-8") as f:
            source = f.read()

        tree = ast.parse(source, filename=str(file_path))
        items: List[DocItem] = []

        # Create extraction context for this file
        module_path = get_module_path(file_path, source_dir)
        context = ExtractionContext(module_path=module_path)

        for node in ast.iter_child_nodes(tree):
            item = extract_from_node(node, file_path, source_dir, context)
            if item:
                items.append(item)

        return items

    except Exception as e:
        print(f"Warning: Failed to parse {file_path}: {e}", file=sys.stderr)
        return []


def extract_from_node(
    node: ast.AST, file_path: Path, source_dir: Path, context: ExtractionContext
) -> Optional[DocItem]:
    """Extract a DocItem from an AST node."""
    if isinstance(node, ast.ClassDef):
        return extract_class(node, file_path, source_dir, context)
    elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
        # Only extract module-level functions
        return extract_function(node, file_path, source_dir, context)

    return None


def extract_class(node: ast.ClassDef, file_path: Path, source_dir: Path, context: ExtractionContext) -> DocItem:
    """Extract a class declaration."""
    fqn = build_fqn(context.module_path, None, node.name)

    # Create a new context for nested items
    nested_context = ExtractionContext(
        module_path=context.module_path,
        current_class=node.name,
        parent_ids=context.parent_ids + [fqn]
    )

    item: DocItem = {
        "id": fqn,
        "name": node.name,
        "kind": ItemKind.CLASS,
        "language": Language.PYTHON,
        "location": get_location(node, file_path, source_dir),
        "children": [],
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract methods and properties
    for child in node.body:
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
            method = extract_method(child, file_path, source_dir, nested_context)
            if method:
                method["parent_id"] = fqn
                if "children" not in item:
                    item["children"] = []
                item["children"].append(method)

    return item


def extract_method(
    node: ast.FunctionDef | ast.AsyncFunctionDef, file_path: Path, source_dir: Path, context: ExtractionContext
) -> DocItem:
    """Extract a method declaration."""
    # Determine visibility based on naming convention
    visibility = "private" if node.name.startswith("_") else "public"

    fqn = build_fqn(context.module_path, context.current_class, node.name)

    item: DocItem = {
        "id": fqn,
        "name": node.name,
        "kind": ItemKind.CONSTRUCTOR if node.name == "__init__" else ItemKind.METHOD,
        "language": Language.PYTHON,
        "location": get_location(node, file_path, source_dir),
        "metadata": {
            "visibility": visibility,
            "signature": {
                "parameters": extract_parameters(node),
            },
        },
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract return type annotation
    if node.returns:
        item["metadata"]["signature"]["returnType"] = {"name": ast.unparse(node.returns)}

    return item


def extract_function(
    node: ast.FunctionDef | ast.AsyncFunctionDef, file_path: Path, source_dir: Path, context: ExtractionContext
) -> DocItem:
    """Extract a function declaration."""
    fqn = build_fqn(context.module_path, None, node.name)

    item: DocItem = {
        "id": fqn,
        "name": node.name,
        "kind": ItemKind.FUNCTION,
        "language": Language.PYTHON,
        "location": get_location(node, file_path, source_dir),
        "metadata": {
            "signature": {
                "parameters": extract_parameters(node),
            },
        },
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract return type annotation
    if node.returns:
        item["metadata"]["signature"]["returnType"] = {"name": ast.unparse(node.returns)}

    return item


def extract_parameters(node: ast.FunctionDef | ast.AsyncFunctionDef) -> List[Parameter]:
    """Extract parameters from a function."""
    parameters: List[Parameter] = []

    for arg in node.args.args:
        # Skip 'self' and 'cls'
        if arg.arg in ("self", "cls"):
            continue

        param: Parameter = {
            "name": arg.arg,
        }

        # Extract type annotation
        if arg.annotation:
            param["type"] = {"name": ast.unparse(arg.annotation)}

        parameters.append(param)

    return parameters


def extract_docblock(node: ast.AST) -> Optional[DocBlock]:
    """Extract docstring as a DocBlock."""
    docstring = ast.get_docstring(node)
    if not docstring:
        return None

    # Parse docstring
    parsed = parse_docstring(docstring)

    docblock: DocBlock = {}

    # Content
    if parsed.short_description or parsed.long_description:
        content_parts = []
        if parsed.short_description:
            content_parts.append(parsed.short_description)
        if parsed.long_description:
            content_parts.append(parsed.long_description)
        docblock["content"] = "\n\n".join(content_parts)

    # Tags - use Record<string, (string | DocTag)[]> format per spec
    tags: Dict[str, List[Any]] = {}

    # Parameters
    for param in parsed.params:
        tag: DocTag = {
            "name": TagName.PARAM,
            "content": param.description or "",
        }
        # Put parameter name and type in parameters object
        parameters: Dict[str, str] = {"name": param.arg_name}
        if param.type_name:
            parameters["type"] = param.type_name
        tag["parameters"] = parameters

        if TagName.PARAM not in tags:
            tags[TagName.PARAM] = []
        tags[TagName.PARAM].append(tag)

    # Returns
    if parsed.returns:
        return_content = parsed.returns.description or ""
        # Simple string for returns per spec examples
        if TagName.RETURNS not in tags:
            tags[TagName.RETURNS] = []
        tags[TagName.RETURNS].append(return_content)

    # Raises/Throws
    for raises in parsed.raises:
        tag: DocTag = {
            "name": TagName.THROWS,
            "content": raises.description or "",
            "parameters": {"name": raises.type_name}
        }
        if TagName.THROWS not in tags:
            tags[TagName.THROWS] = []
        tags[TagName.THROWS].append(tag)

    if tags:
        docblock["tags"] = tags

    return docblock if docblock else None


def get_location(node: ast.AST, file_path: Path, source_dir: Path) -> Location:
    """Get source location for a node."""
    return {
        "path": str(file_path.relative_to(source_dir)),
        "number": node.lineno,
        "column": node.col_offset + 1,
    }


def get_project_version(source_dir: Path) -> Optional[str]:
    """Get project version from pyproject.toml or setup.py."""
    # Try pyproject.toml
    pyproject_path = source_dir / "pyproject.toml"
    if pyproject_path.exists():
        try:
            if sys.version_info >= (3, 11):
                import tomllib
                with pyproject_path.open("rb") as f:
                    data = tomllib.load(f)
                    return data.get("project", {}).get("version")
            else:
                # For Python < 3.11, skip tomllib
                pass
        except Exception:
            pass

    # Try __version__ in __init__.py
    init_path = source_dir / "__init__.py"
    if init_path.exists():
        try:
            with init_path.open("r") as f:
                for line in f:
                    if line.startswith("__version__"):
                        return line.split("=")[1].strip().strip('"').strip("'")
        except Exception:
            pass

    return None
