#include "calculator.h"
#include <stdio.h>

int main() {
    // Create a calculator with precision 2
    calc_context_t* calc = calc_create(2);
    if (!calc) {
        printf("Failed to create calculator\n");
        return 1;
    }

    double result;
    calc_error_t error;

    // Perform calculations
    printf("Calculator Demo\n");
    printf("===============\n");

    error = calc_add(calc, 2.0, 3.0, &result);
    if (error == CALC_OK) {
        printf("2 + 3 = %.2f\n", result);
    }

    error = calc_subtract(calc, 10.0, 4.0, &result);
    if (error == CALC_OK) {
        printf("10 - 4 = %.2f\n", result);
    }

    error = calc_multiply(calc, 5.0, 6.0, &result);
    if (error == CALC_OK) {
        printf("5 * 6 = %.2f\n", result);
    }

    error = calc_divide(calc, 20.0, 4.0, &result);
    if (error == CALC_OK) {
        printf("20 / 4 = %.2f\n", result);
    }

    error = calc_power(calc, 2.0, 3.0, &result);
    if (error == CALC_OK) {
        printf("2^3 = %.2f\n", result);
    }

    error = calc_sqrt(calc, 9.0, &result);
    if (error == CALC_OK) {
        printf("√9 = %.2f\n", result);
    }

    printf("π = %f\n", CALC_PI);
    printf("e = %f\n", CALC_E);

    // Test error handling
    printf("\nTesting error handling:\n");
    error = calc_divide(calc, 10.0, 0.0, &result);
    if (error != CALC_OK) {
        printf("10 / 0 = Error: %s\n", calc_get_error_message(calc));
    }

    // Test config
    calc_config_t config = {
        .debug = 1,
        .timeout = 5000,
        .max_retries = 3
    };

    if (calc_apply_config(calc, &config) == 0) {
        printf("\nConfig applied successfully\n");
    }

    // Clean up
    calc_destroy(calc);
    return 0;
}