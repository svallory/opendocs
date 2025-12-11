"""JSON Schema validation for OpenDocs DocSets."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict

try:
    import jsonschema
    from jsonschema import ValidationError
    JSONSCHEMA_AVAILABLE = True
except ImportError:
    JSONSCHEMA_AVAILABLE = False
    ValidationError = Exception  # type: ignore


class ValidationErrorDetail(TypedDict):
    """Details about a validation error."""
    path: str
    message: str
    validator: Optional[str]


class ValidationResult(TypedDict):
    """Result of DocSet validation."""
    valid: bool
    errors: Optional[List[ValidationErrorDetail]]


# Load schema once at module level
_schema: Optional[Dict[str, Any]] = None


def _load_schema() -> Dict[str, Any]:
    """Load the OpenDocs JSON schema."""
    global _schema
    if _schema is None:
        schema_path = Path(__file__).parent / "opendocs.schema.json"
        with schema_path.open("r") as f:
            _schema = json.load(f)
    return _schema


def validate_docset(doc_set: Any) -> ValidationResult:
    """
    Validate a DocSet against the OpenDocs JSON Schema.

    This function validates the structure and types of a DocSet object
    to ensure it conforms to the OpenDocs specification.

    Args:
        doc_set: The DocSet to validate (typically a dict)

    Returns:
        ValidationResult with valid flag and errors if invalid

    Raises:
        ImportError: If jsonschema package is not installed

    Example:
        ```python
        from opendocs_model import validate_docset

        doc_set = load_documentation('./opendocs.json')
        result = validate_docset(doc_set)

        if not result['valid']:
            print('Validation failed:')
            for error in result['errors'] or []:
                print(f"  {error['path']}: {error['message']}")
        ```
    """
    if not JSONSCHEMA_AVAILABLE:
        raise ImportError(
            "jsonschema package is required for validation. "
            "Install it with: pip install jsonschema"
        )

    schema = _load_schema()
    validator = jsonschema.Draft7Validator(schema)

    errors_list: List[ValidationErrorDetail] = []
    for error in validator.iter_errors(doc_set):
        # Convert JSON path to string
        path = "/" + "/".join(str(p) for p in error.absolute_path)
        if not path or path == "/":
            path = "root"

        errors_list.append({
            "path": path,
            "message": error.message,
            "validator": error.validator,
        })

    if errors_list:
        return {"valid": False, "errors": errors_list}

    return {"valid": True, "errors": None}


def assert_valid_docset(doc_set: Any) -> None:
    """
    Validate a DocSet and raise an error if invalid.

    This is a convenience function for cases where you want to
    fail fast on invalid input.

    Args:
        doc_set: The DocSet to validate

    Raises:
        ImportError: If jsonschema package is not installed
        ValueError: If validation fails

    Example:
        ```python
        from opendocs_model import assert_valid_docset

        try:
            doc_set = load_documentation('./opendocs.json')
            assert_valid_docset(doc_set)
            # Proceed with valid doc_set
        except ValueError as error:
            print(f'Invalid opendocs.json: {error}')
        ```
    """
    result = validate_docset(doc_set)

    if not result["valid"]:
        error_messages = "\n".join(
            f"  {err['path']}: {err['message']}"
            for err in (result["errors"] or [])
        )
        raise ValueError(
            f"DocSet validation failed:\n{error_messages or 'Unknown validation error'}"
        )
