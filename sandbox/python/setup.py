"""Setup file for test library."""

from setuptools import setup, find_packages

setup(
    name="test-library",
    version="1.0.0",
    description="Test library for OpenDocs Python extractor",
    py_modules=["calculator"],
    python_requires=">=3.8",
)
