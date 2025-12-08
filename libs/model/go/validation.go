package model

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"github.com/xeipuuv/gojsonschema"
)

//go:embed opendocs.schema.json
var schemaJSON string

// ValidationError represents a single validation error
type ValidationError struct {
	Path    string
	Message string
	Value   interface{}
}

// ValidationResult contains the result of DocSet validation
type ValidationResult struct {
	Valid  bool
	Errors []ValidationError
}

var schema *gojsonschema.Schema

// loadSchema loads and compiles the OpenDocs JSON schema (once)
func loadSchema() (*gojsonschema.Schema, error) {
	if schema != nil {
		return schema, nil
	}

	schemaLoader := gojsonschema.NewStringLoader(schemaJSON)
	var err error
	schema, err = gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		return nil, fmt.Errorf("failed to load schema: %w", err)
	}

	return schema, nil
}

// ValidateDocSet validates a DocSet against the OpenDocs JSON Schema.
//
// This function validates the structure and types of a DocSet to ensure
// it conforms to the OpenDocs specification.
//
// Example:
//
//	docSet := &model.DocSet{ /* ... */ }
//	result, err := model.ValidateDocSet(docSet)
//	if err != nil {
//	    return err
//	}
//
//	if !result.Valid {
//	    fmt.Println("Validation failed:")
//	    for _, e := range result.Errors {
//	        fmt.Printf("  %s: %s\n", e.Path, e.Message)
//	    }
//	}
func ValidateDocSet(docSet *DocSet) (*ValidationResult, error) {
	schema, err := loadSchema()
	if err != nil {
		return nil, err
	}

	// Convert DocSet to JSON for validation
	docSetJSON, err := json.Marshal(docSet)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal DocSet: %w", err)
	}

	documentLoader := gojsonschema.NewBytesLoader(docSetJSON)
	result, err := schema.Validate(documentLoader)
	if err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	if result.Valid() {
		return &ValidationResult{Valid: true}, nil
	}

	// Convert errors to our format
	errors := make([]ValidationError, 0, len(result.Errors()))
	for _, err := range result.Errors() {
		errors = append(errors, ValidationError{
			Path:    err.Context().String(),
			Message: err.Description(),
			Value:   err.Value(),
		})
	}

	return &ValidationResult{
		Valid:  false,
		Errors: errors,
	}, nil
}

// AssertValidDocSet validates a DocSet and returns an error if invalid.
//
// This is a convenience function for cases where you want to fail fast
// on invalid input.
//
// Example:
//
//	docSet := &model.DocSet{ /* ... */ }
//	if err := model.AssertValidDocSet(docSet); err != nil {
//	    return fmt.Errorf("invalid DocSet: %w", err)
//	}
func AssertValidDocSet(docSet *DocSet) error {
	result, err := ValidateDocSet(docSet)
	if err != nil {
		return err
	}

	if !result.Valid {
		errorMsg := "DocSet validation failed:\n"
		for _, e := range result.Errors {
			errorMsg += fmt.Sprintf("  %s: %s\n", e.Path, e.Message)
		}
		return fmt.Errorf("%s", errorMsg)
	}

	return nil
}
