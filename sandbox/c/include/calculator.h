/**
 * @file calculator.h
 * @brief A simple calculator library for C
 * @author OpenDocs Example
 * @version 1.0.0
 */

#ifndef CALCULATOR_H
#define CALCULATOR_H

#include <stddef.h>

/**
 * @brief Calculator error codes
 */
typedef enum {
    CALC_OK = 0,        /**< No error */
    CALC_ERROR_DIV_ZERO,/**< Division by zero error */
    CALC_ERROR_OVERFLOW /**< Overflow error */
} calc_error_t;

/**
 * @brief Calculator context structure
 */
typedef struct {
    int precision;      /**< Number of decimal places */
    int last_error;     /**< Last error code */
} calc_context_t;

/**
 * @brief Creates a new calculator context
 * @param precision Number of decimal places for rounding
 * @return New calculator context
 */
calc_context_t* calc_create(int precision);

/**
 * @brief Destroys a calculator context
 * @param ctx Calculator context to destroy
 */
void calc_destroy(calc_context_t* ctx);

/**
 * @brief Adds two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of addition
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_add(calc_context_t* ctx, double a, double b, double* result);

/**
 * @brief Subtracts two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of subtraction
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_subtract(calc_context_t* ctx, double a, double b, double* result);

/**
 * @brief Multiplies two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of multiplication
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_multiply(calc_context_t* ctx, double a, double b, double* result);

/**
 * @brief Divides two numbers
 * @param ctx Calculator context
 * @param a Dividend
 * @param b Divisor
 * @param result Result of division
 * @return Error code (CALC_OK on success, CALC_ERROR_DIV_ZERO if b is 0)
 */
calc_error_t calc_divide(calc_context_t* ctx, double a, double b, double* result);

/**
 * @brief Calculates power of a number
 * @param ctx Calculator context
 * @param base Base number
 * @param exponent Exponent
 * @param result Result of power operation
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_power(calc_context_t* ctx, double base, double exponent, double* result);

/**
 * @brief Calculates square root
 * @param ctx Calculator context
 * @param value Value to calculate square root of
 * @param result Result of square root
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_sqrt(calc_context_t* ctx, double value, double* result);

/**
 * @brief Gets the last error message
 * @param ctx Calculator context
 * @return Error message string
 */
const char* calc_get_error_message(calc_context_t* ctx);

/**
 * @brief Mathematical constant PI
 */
#define CALC_PI 3.14159265358979323846

/**
 * @brief Mathematical constant E
 */
#define CALC_E 2.71828182845904523536

/**
 * @brief Configuration structure
 */
typedef struct {
    int debug;          /**< Enable debug mode */
    int timeout;        /**< Operation timeout in milliseconds */
    int max_retries;    /**< Maximum number of retries */
} calc_config_t;

/**
 * @brief Applies configuration to calculator
 * @param ctx Calculator context
 * @param config Configuration to apply
 * @return 0 on success, -1 on error
 */
int calc_apply_config(calc_context_t* ctx, const calc_config_t* config);

#endif /* CALCULATOR_H */