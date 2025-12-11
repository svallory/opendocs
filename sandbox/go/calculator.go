package testlibrary

import "math"

// Calculator provides basic arithmetic operations
type Calculator struct {
	// Precision determines the decimal precision for operations
	Precision int
}

// Add returns the sum of two numbers
func (c *Calculator) Add(a, b float64) float64 {
	return a + b
}

// Subtract returns the difference between two numbers
func (c *Calculator) Subtract(a, b float64) float64 {
	return a - b
}

// Multiply returns the product of two numbers
func (c *Calculator) Multiply(a, b float64) float64 {
	return a * b
}

// PI represents the mathematical constant pi
const PI = math.Pi

// Config holds configuration options for the library
type Config struct {
	// Debug enables debug mode
	Debug bool `json:"debug"`

	// MaxRetries specifies the maximum number of retries
	MaxRetries int `json:"max_retries,omitempty"`

	// Timeout specifies the timeout in milliseconds
	Timeout int `json:"timeout"`
}

// LogLevel represents logging levels
type LogLevel int

const (
	// DEBUG level for debug messages
	DEBUG LogLevel = iota
	// INFO level for informational messages
	INFO
	// WARN level for warning messages
	WARN
	// ERROR level for error messages
	ERROR
)

// Result represents the result of an operation
type Result struct {
	// Success indicates if the operation was successful
	Success bool `json:"success"`

	// Data holds the result data
	Data interface{} `json:"data,omitempty"`

	// Error holds the error message if any
	Error string `json:"error,omitempty"`
}

// Greet returns a greeting message for the given name
func Greet(name string) string {
	return "Hello, " + name + "!"
}

// FormatCurrency formats an amount as currency
func FormatCurrency(amount float64, currency string) string {
	if currency == "" {
		currency = "USD"
	}
	return currency + " " + math.Round(amount*100)/100
}
