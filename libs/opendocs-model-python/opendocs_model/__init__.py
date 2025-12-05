"""
Python types for the OpenDocs universal documentation format.

This library provides type-safe Python classes and TypedDicts for working with
OpenDocs documentation. It implements the OpenDocs specification's core models.
"""

__version__ = "0.1.0"

from .model import (
    # Core models
    DocSet,
    Project,
    DocItem,
    DocBlock,
    DocTag,
    ContainerRef,
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
    VERSION,
)

__all__ = [
    # Core models
    "DocSet",
    "Project",
    "DocItem",
    "DocBlock",
    "DocTag",
    "ContainerRef",
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
    "VERSION",
    "__version__",
]
