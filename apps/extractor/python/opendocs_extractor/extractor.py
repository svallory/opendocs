"""Python documentation extractor using AST."""

import ast
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional

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
)


def extract_documentation(
    source_dir: Path,
    project_name: Optional[str] = None,
    project_id: Optional[str] = None,
    project_version: Optional[str] = None,
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
        "id": project_id or source_dir.name,
        "name": project_name or source_dir.name,
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

    # Create Project
    project: DocSet["projects"][0] = {  # type: ignore
        "id": project_id or source_dir.name,
        "name": project_name or source_dir.name,
        "language": Language.PYTHON,
        "version": project_version or get_project_version(source_dir),
        "items": [],
    }

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

        for node in ast.iter_child_nodes(tree):
            item = extract_from_node(node, file_path, source_dir)
            if item:
                items.append(item)

        return items

    except Exception as e:
        print(f"Warning: Failed to parse {file_path}: {e}", file=sys.stderr)
        return []


def extract_from_node(
    node: ast.AST, file_path: Path, source_dir: Path
) -> Optional[DocItem]:
    """Extract a DocItem from an AST node."""
    if isinstance(node, ast.ClassDef):
        return extract_class(node, file_path, source_dir)
    elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
        # Only extract module-level functions
        return extract_function(node, file_path, source_dir)

    return None


def extract_class(node: ast.ClassDef, file_path: Path, source_dir: Path) -> DocItem:
    """Extract a class declaration."""
    item: DocItem = {
        "id": node.name,
        "name": node.name,
        "kind": ItemKind.CLASS,
        "location": get_location(node, file_path, source_dir),
        "items": [],
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract methods and properties
    for child in node.body:
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
            method = extract_method(child, file_path, source_dir)
            if method:
                if "items" not in item:
                    item["items"] = []
                item["items"].append(method)

    return item


def extract_method(
    node: ast.FunctionDef | ast.AsyncFunctionDef, file_path: Path, source_dir: Path
) -> DocItem:
    """Extract a method declaration."""
    # Determine visibility based on naming convention
    visibility = "private" if node.name.startswith("_") else "public"

    item: DocItem = {
        "id": node.name,
        "name": node.name,
        "kind": ItemKind.CONSTRUCTOR if node.name == "__init__" else ItemKind.METHOD,
        "location": get_location(node, file_path, source_dir),
        "visibility": visibility,  # type: ignore
        "signature": {
            "parameters": extract_parameters(node),
        },
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract return type annotation
    if node.returns:
        if "signature" not in item:
            item["signature"] = {}
        item["signature"]["returnType"] = {"name": ast.unparse(node.returns)}

    return item


def extract_function(
    node: ast.FunctionDef | ast.AsyncFunctionDef, file_path: Path, source_dir: Path
) -> DocItem:
    """Extract a function declaration."""
    item: DocItem = {
        "id": node.name,
        "name": node.name,
        "kind": ItemKind.FUNCTION,
        "location": get_location(node, file_path, source_dir),
        "signature": {
            "parameters": extract_parameters(node),
        },
    }

    # Extract docstring
    docblock = extract_docblock(node)
    if docblock:
        item["docBlock"] = docblock

    # Extract return type annotation
    if node.returns:
        item["signature"]["returnType"] = {"name": ast.unparse(node.returns)}

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

    # Description
    if parsed.short_description or parsed.long_description:
        description_parts = []
        if parsed.short_description:
            description_parts.append(parsed.short_description)
        if parsed.long_description:
            description_parts.append(parsed.long_description)
        docblock["description"] = "\n\n".join(description_parts)

    # Tags
    tags: List[DocTag] = []

    # Parameters
    for param in parsed.params:
        tag: DocTag = {
            "tag": TagName.PARAM,
            "name": param.arg_name,
        }
        if param.type_name:
            tag["type"] = param.type_name
        if param.description:
            tag["content"] = param.description
        tags.append(tag)

    # Returns
    if parsed.returns:
        tag: DocTag = {"tag": TagName.RETURNS}
        if parsed.returns.type_name:
            tag["type"] = parsed.returns.type_name
        if parsed.returns.description:
            tag["content"] = parsed.returns.description
        tags.append(tag)

    # Raises
    for raises in parsed.raises:
        tag: DocTag = {
            "tag": TagName.THROWS,
            "name": raises.type_name,
        }
        if raises.description:
            tag["content"] = raises.description
        tags.append(tag)

    if tags:
        docblock["tags"] = tags

    return docblock if docblock else None


def get_location(node: ast.AST, file_path: Path, source_dir: Path) -> Location:
    """Get source location for a node."""
    return {
        "file": str(file_path.relative_to(source_dir)),
        "line": node.lineno,
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
