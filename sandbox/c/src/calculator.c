#include "calculator.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <math.h>

/**
 * @brief Creates a new calculator context
 * @param precision Number of decimal places for rounding
 * @return New calculator context
 */
calc_context_t* calc_create(int precision) {
    calc_context_t* ctx = malloc(sizeof(calc_context_t));
    if (ctx) {
        ctx->precision = precision;
        ctx->last_error = CALC_OK;
    }
    return ctx;
}

/**
 * @brief Destroys a calculator context
 * @param ctx Calculator context to destroy
 */
void calc_destroy(calc_context_t* ctx) {
    free(ctx);
}

/**
 * @brief Adds two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of addition
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_add(calc_context_t* ctx, double a, double b, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    *result = a + b;
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Subtracts two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of subtraction
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_subtract(calc_context_t* ctx, double a, double b, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    *result = a - b;
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Multiplies two numbers
 * @param ctx Calculator context
 * @param a First number
 * @param b Second number
 * @param result Result of multiplication
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_multiply(calc_context_t* ctx, double a, double b, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    *result = a * b;
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Divides two numbers
 * @param ctx Calculator context
 * @param a Dividend
 * @param b Divisor
 * @param result Result of division
 * @return Error code (CALC_OK on success, CALC_ERROR_DIV_ZERO if b is 0)
 */
calc_error_t calc_divide(calc_context_t* ctx, double a, double b, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    if (b == 0.0) {
        ctx->last_error = CALC_ERROR_DIV_ZERO;
        return CALC_ERROR_DIV_ZERO;
    }

    *result = a / b;
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Calculates power of a number
 * @param ctx Calculator context
 * @param base Base number
 * @param exponent Exponent
 * @param result Result of power operation
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_power(calc_context_t* ctx, double base, double exponent, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    *result = pow(base, exponent);
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Calculates square root
 * @param ctx Calculator context
 * @param value Value to calculate square root of
 * @param result Result of square root
 * @return Error code (CALC_OK on success)
 */
calc_error_t calc_sqrt(calc_context_t* ctx, double value, double* result) {
    if (!ctx || !result) {
        return CALC_ERROR_OVERFLOW;
    }

    *result = sqrt(value);
    ctx->last_error = CALC_OK;
    return CALC_OK;
}

/**
 * @brief Gets the last error message
 * @param ctx Calculator context
 * @return Error message string
 */
const char* calc_get_error_message(calc_context_t* ctx) {
    if (!ctx) {
        return "Invalid context";
    }

    switch (ctx->last_error) {
        case CALC_OK:
            return "No error";
        case CALC_ERROR_DIV_ZERO:
            return "Division by zero";
        case CALC_ERROR_OVERFLOW:
            return "Overflow error";
        default:
            return "Unknown error";
    }
}

/**
 * @brief Applies configuration to calculator
 * @param ctx Calculator context
 * @param config Configuration to apply
 * @return 0 on success, -1 on error
 */
int calc_apply_config(calc_context_t* ctx, const calc_config_t* config) {
    if (!ctx || !config) {
        return -1;
    }

    // In a real implementation, we would apply the configuration
    // For now, just validate inputs
    if (config->timeout < 0 || config->max_retries < 0) {
        return -1;
    }

    return 0;
}