"""
Python types for the OpenDocs universal documentation format.

This library provides type-safe Python classes and TypedDicts for working with
OpenDocs documentation. It implements the OpenDocs specification's six core models:

- DocSet: The root object (opendocs.json file)
- Project: Individual projects in a monorepo with repository information
- DocItem: Universal element representing any documentable code with source locations
- DocBlock: Structured documentation content
- DocTag: Individual documentation tags
- Relation: Flexible relationship model for code relationships
"""

__version__ = "0.2.0"

from .model import (
    # Core models
    DocSet,
    Project,
    DocItem,
    DocBlock,
    DocTag,
    Relation,
    Relations,
    # Supporting types
    Metadata,
    Generator,
    Repository,
    Location,
    Signature,
    Parameter,
    TypeParameter,
    TypeReference,
    Deprecated,
    # Constants
    ItemKind,
    TagName,
    Language,
    RelationKind,
    VERSION,
)

__all__ = [
    # Core models
    "DocSet",
    "Project",
    "DocItem",
    "DocBlock",
    "DocTag",
    "Relation",
    "Relations",
    # Supporting types
    "Metadata",
    "Generator",
    "Repository",
    "Location",
    "Signature",
    "Parameter",
    "TypeParameter",
    "TypeReference",
    "Deprecated",
    # Constants
    "ItemKind",
    "TagName",
    "Language",
    "RelationKind",
    "VERSION",
    "__version__",
]
