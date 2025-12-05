package extractor_test

import (
	"encoding/json"
	"flag"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/google/go-cmp/cmp"
)

var update = flag.Bool("update", false, "update golden files")

func TestExtractGoSandbox(t *testing.T) {
	extractorPath := filepath.Join("..", "..", "..", "bin", "opendocs-extract-go")
	sandboxPath := filepath.Join("..", "..", "..", "..", "..", "..", "sandbox", "go")
	goldenFile := filepath.Join("testdata", "golden.json")

	// Check if extractor exists
	if _, err := os.Stat(extractorPath); os.IsNotExist(err) {
		t.Skip("Go extractor binary not built")
	}

	// Convert paths to absolute
	absExtractorPath, err := filepath.Abs(extractorPath)
	if err != nil {
		t.Fatalf("Failed to get absolute path for extractor: %v", err)
	}
	absSandboxPath, err := filepath.Abs(sandboxPath)
	if err != nil {
		t.Fatalf("Failed to get absolute path for sandbox: %v", err)
	}

	// Run the extractor
	outputPath := filepath.Join(absSandboxPath, "opendocs.json")
	cmd := exec.Command(absExtractorPath, "extract", "--source", absSandboxPath, "--output", outputPath, "--project-name", "testlibrary")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Failed to run Go extractor: %v\nOutput: %s", err, string(output))
	}

	// Read output file
	outputData, err := os.ReadFile(outputPath)
	if err != nil {
		t.Fatalf("Failed to read output file: %v", err)
	}

	// Parse the output JSON
	var actual map[string]interface{}
	if err := json.Unmarshal(outputData, &actual); err != nil {
		t.Fatalf("Failed to parse extracted JSON: %v", err)
	}

	// Remove timestamp fields for comparison (they change on every run)
	if metadata, ok := actual["metadata"].(map[string]interface{}); ok {
		delete(metadata, "created")
		delete(metadata, "modified")
	}

	// Update golden file if flag is set
	if *update {
		if err := os.MkdirAll(filepath.Dir(goldenFile), 0755); err != nil {
			t.Fatalf("Failed to create testdata directory: %v", err)
		}

		goldenData, err := json.MarshalIndent(actual, "", "  ")
		if err != nil {
			t.Fatalf("Failed to marshal golden data: %v", err)
		}

		if err := os.WriteFile(goldenFile, goldenData, 0644); err != nil {
			t.Fatalf("Failed to write golden file: %v", err)
		}

		t.Log("Golden file updated")
		return
	}

	// Load golden file
	goldenData, err := os.ReadFile(goldenFile)
	if err != nil {
		t.Fatalf("Failed to read golden file: %v (run with -update to create it)", err)
	}

	var expected map[string]interface{}
	if err := json.Unmarshal(goldenData, &expected); err != nil {
		t.Fatalf("Failed to parse golden file: %v", err)
	}

	// Compare actual vs expected
	if diff := cmp.Diff(expected, actual); diff != "" {
		t.Errorf("Extracted output differs from golden file (-want +got):\n%s", diff)
		t.Log("Run with -update flag to update the golden file")
	}
}
