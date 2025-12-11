#pragma once

#include <string>
#include <vector>
#include <memory>

namespace calc {

/**
 * @brief A simple calculator class for testing documentation extraction
 *
 * This class provides basic arithmetic operations and demonstrates
 * various C++ documentation features including Doxygen-style comments.
 */
class Calculator {
public:
    /**
     * @brief Mathematical constant PI
     */
    static constexpr double PI = 3.14159265359;

    /**
     * @brief Constructor
     * @param precision Number of decimal places for results
     */
    explicit Calculator(int precision = 2);

    /**
     * @brief Destructor
     */
    ~Calculator() = default;

    /**
     * @brief Add two numbers together
     * @param a First number
     * @param b Second number
     * @return The sum of a and b
     */
    double add(double a, double b);

    /**
     * @brief Subtract b from a
     * @param a Number to subtract from
     * @param b Number to subtract
     * @return The difference
     */
    double subtract(double a, double b);

    /**
     * @brief Multiply two numbers
     * @param a First number
     * @param b Second number
     * @return The product
     */
    static double multiply(double a, double b);

    /**
     * @brief Divide a by b
     * @param a Dividend
     * @param b Divisor
     * @return The quotient
     * @throws std::runtime_error if b is zero
     */
    static double divide(double a, double b);

    /**
     * @brief Calculate the power of a number
     * @param base The base number
     * @param exp The exponent
     * @return The result of base raised to the power of exp
     */
    static double power(double base, double exp);

    /**
     * @brief Calculate the square root of a number
     * @param x The number
     * @return The square root of x
     * @throws std::runtime_error if x is negative
     */
    static double sqrt(double x);

    /**
     * @brief Get the current precision setting
     * @return The number of decimal places
     */
    int getPrecision() const { return precision_; }

    /**
     * @brief Set the precision for calculations
     * @param precision Number of decimal places
     */
    void setPrecision(int precision) { precision_ = precision; }

private:
    int precision_;

    /**
     * @brief Helper function to round a number to the specified precision
     * @param value The value to round
     * @return The rounded value
     */
    double round(double value);
};

/**
 * @brief Configuration options for the calculator library
 */
struct Config {
    bool debug = false;          ///< Enable debug mode
    int maxRetries = 3;          ///< Maximum number of retries
    int timeout = 5000;          ///< Timeout in milliseconds
    std::string logLevel = "INFO"; ///< Log level (DEBUG, INFO, WARN, ERROR)

    /**
     * @brief Constructor with parameters
     */
    Config(bool debug, int timeout, int maxRetries = 3);
};

/**
 * @brief Log levels enumeration
 */
enum class LogLevel {
    DEBUG = 0,  ///< Debug level logging
    INFO = 1,   ///< Info level logging
    WARNING = 2, ///< Warning level logging
    ERROR = 3   ///< Error level logging
};

/**
 * @brief Result type for operations that can fail
 */
template<typename T>
struct Result {
    bool success;
    T data;
    std::string error;
};

/**
 * @brief Greet a user by name
 * @param name Name of the person to greet
 * @return A greeting message
 */
std::string greet(const std::string& name);

/**
 * @brief Format a number as currency
 * @param amount The amount to format
 * @param currency Currency code (default: USD)
 * @return Formatted currency string
 */
std::string formatCurrency(double amount, const std::string& currency = "USD");

} // namespace calc