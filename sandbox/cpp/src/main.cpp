#include "calculator.hpp"
#include <iostream>

int main() {
    // Create a calculator with precision 2
    calc::Calculator calc(2);

    // Perform calculations
    std::cout << "Calculator Demo" << std::endl;
    std::cout << "===============" << std::endl;
    std::cout << "2 + 3 = " << calc.add(2.0, 3.0) << std::endl;
    std::cout << "10 - 4 = " << calc.subtract(10.0, 4.0) << std::endl;
    std::cout << "5 * 6 = " << calc::Calculator::multiply(5.0, 6.0) << std::endl;
    std::cout << "20 / 4 = " << calc::Calculator::divide(20.0, 4.0) << std::endl;
    std::cout << "2^3 = " << calc::Calculator::power(2.0, 3.0) << std::endl;
    std::cout << "√9 = " << calc::Calculator::sqrt(9.0) << std::endl;
    std::cout << "π = " << calc::Calculator::PI << std::endl;

    // Test greeting
    std::cout << "\n" << calc::greet("World") << std::endl;

    // Test currency formatting
    std::cout << "Currency: " << calc::formatCurrency(123.456, "USD") << std::endl;
    std::cout << "Currency: " << calc::formatCurrency(123.456, "EUR") << std::endl;

    // Test config
    calc::Config config(true, 5000, 3);
    std::cout << "\nConfig: debug=" << config.debug
              << ", timeout=" << config.timeout
              << "ms, maxRetries=" << config.maxRetries << std::endl;

    return 0;
}