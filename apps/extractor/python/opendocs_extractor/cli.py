#!/usr/bin/env python3
"""CLI for OpenDocs Python extractor."""

import json
import sys
from pathlib import Path
from typing import Optional

import click

from .extractor import extract_documentation


@click.group()
@click.version_option(version="0.1.0")
def cli() -> None:
    """Extract OpenDocs documentation from Python projects."""
    pass


@cli.command()
@click.option(
    "-s",
    "--source",
    type=click.Path(exists=True, path_type=Path),
    default=".",
    help="Source directory to analyze",
)
@click.option(
    "-o",
    "--output",
    type=click.Path(path_type=Path),
    default="opendocs.json",
    help="Output file path",
)
@click.option("--project-name", type=str, help="Project name")
@click.option("--project-id", type=str, help="Project ID")
@click.option("--project-version", type=str, help="Project version")
def extract(
    source: Path,
    output: Path,
    project_name: Optional[str],
    project_id: Optional[str],
    project_version: Optional[str],
) -> None:
    """Extract documentation from a Python project."""
    try:
        click.echo(f"Extracting documentation from {source}...")
        click.echo(f"Output: {output}")

        # Extract documentation
        doc_set = extract_documentation(
            source_dir=source,
            project_name=project_name,
            project_id=project_id,
            project_version=project_version,
        )

        # Write output
        output.parent.mkdir(parents=True, exist_ok=True)
        with output.open("w", encoding="utf-8") as f:
            json.dump(doc_set, f, indent=2, ensure_ascii=False)

        click.echo(f"✓ Documentation extracted successfully to {output}")
        click.echo(f"  Projects: {len(doc_set['projects'])}")
        total_items = sum(len(p.get("items", [])) for p in doc_set["projects"])
        click.echo(f"  Total items: {total_items}")

    except Exception as e:
        click.echo(f"Error extracting documentation: {e}", err=True)
        sys.exit(1)


def main() -> None:
    """Entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()
