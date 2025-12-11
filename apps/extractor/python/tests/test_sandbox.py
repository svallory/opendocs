import json
import subprocess
import sys
from pathlib import Path

import pytest


def test_extract_python_sandbox(snapshot):
    """Test that Python sandbox extraction produces expected output."""
    sandbox_path = Path(__file__).parent.parent.parent.parent.parent / "sandbox" / "python"
    output_path = sandbox_path / "opendocs.json"

    # Run the extractor
    result = subprocess.run(
        [sys.executable, "-m", "opendocs_extractor.cli", "extract",
         "--source", str(sandbox_path),
         "--project-name", "test-library",
         "--output", str(output_path)],
        capture_output=True,
        text=True,
        check=True,
    )

    # Read the generated output
    extracted = json.loads(output_path.read_text())

    # Remove dynamic fields that change between runs
    if "metadata" in extracted:
        if "created" in extracted["metadata"]:
            del extracted["metadata"]["created"]
        if "modified" in extracted["metadata"]:
            del extracted["metadata"]["modified"]

    # Compare against snapshot
    snapshot.assert_match(json.dumps(extracted, indent=2, sort_keys=True), "python_sandbox.json")