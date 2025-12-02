"""
OpenDocs extractor for Python projects.

Extracts API documentation from Python source code and converts it
to the OpenDocs universal format.
"""

__version__ = "0.1.0"

from .extractor import extract_documentation

__all__ = ["extract_documentation", "__version__"]
