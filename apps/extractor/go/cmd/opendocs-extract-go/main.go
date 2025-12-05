package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/cobra"
	"github.com/svallory/opendocs/apps/opendocs-extractor-go/internal/extractor"
)

var (
	sourcePath     string
	outputPath     string
	projectName    string
	projectID      string
	projectVersion string
)

var rootCmd = &cobra.Command{
	Use:   "opendocs-extract-go",
	Short: "Extract OpenDocs documentation from Go projects",
	Long:  `OpenDocs extractor for Go - extracts API documentation and converts to OpenDocs format`,
}

var extractCmd = &cobra.Command{
	Use:   "extract",
	Short: "Extract documentation from a Go project",
	RunE: func(cmd *cobra.Command, args []string) error {
		fmt.Printf("Extracting documentation from %s...\n", sourcePath)
		fmt.Printf("Output: %s\n", outputPath)

		// Extract documentation
		docSet, err := extractor.ExtractDocumentation(extractor.Options{
			SourcePath:     sourcePath,
			ProjectName:    projectName,
			ProjectID:      projectID,
			ProjectVersion: projectVersion,
		})
		if err != nil {
			return fmt.Errorf("failed to extract documentation: %w", err)
		}

		// Create output directory if needed
		outputDir := filepath.Dir(outputPath)
		if err := os.MkdirAll(outputDir, 0755); err != nil {
			return fmt.Errorf("failed to create output directory: %w", err)
		}

		// Write output
		data, err := json.MarshalIndent(docSet, "", "  ")
		if err != nil {
			return fmt.Errorf("failed to marshal documentation: %w", err)
		}

		if err := os.WriteFile(outputPath, data, 0644); err != nil {
			return fmt.Errorf("failed to write output file: %w", err)
		}

		fmt.Printf("✓ Documentation extracted successfully to %s\n", outputPath)
		fmt.Printf("  Projects: %d\n", len(docSet.Projects))
		totalItems := 0
		for _, p := range docSet.Projects {
			totalItems += len(p.Items)
		}
		fmt.Printf("  Total items: %d\n", totalItems)

		return nil
	},
}

func init() {
	extractCmd.Flags().StringVarP(&sourcePath, "source", "s", ".", "Source directory to analyze")
	extractCmd.Flags().StringVarP(&outputPath, "output", "o", "opendocs.json", "Output file path")
	extractCmd.Flags().StringVar(&projectName, "project-name", "", "Project name")
	extractCmd.Flags().StringVar(&projectID, "project-id", "", "Project ID")
	extractCmd.Flags().StringVar(&projectVersion, "project-version", "", "Project version")

	rootCmd.AddCommand(extractCmd)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
