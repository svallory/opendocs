#include "calculator.hpp"
#include <math>
#include <sstream>
#include <iomanip>
#include <stdexcept>

namespace calc {

Calculator::Calculator(int precision) : precision_(precision) {}

double Calculator::add(double a, double b) {
    double result = a + b;
    return round(result);
}

double Calculator::subtract(double a, double b) {
    double result = a - b;
    return round(result);
}

double Calculator::multiply(double a, double b) {
    return a * b;
}

double Calculator::divide(double a, double b) {
    if (b == 0.0) {
        throw std::runtime_error("Division by zero");
    }
    return a / b;
}

double Calculator::power(double base, double exp) {
    return std::pow(base, exp);
}

double Calculator::sqrt(double x) {
    if (x < 0.0) {
        throw std::runtime_error("Cannot calculate square root of negative number");
    }
    return std::sqrt(x);
}

double Calculator::round(double value) {
    double multiplier = std::pow(10.0, precision_);
    return std::round(value * multiplier) / multiplier;
}

Config::Config(bool debug, int timeout, int maxRetries)
    : debug(debug), timeout(timeout), maxRetries(maxRetries) {}

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

std::string formatCurrency(double amount, const std::string& currency) {
    std::ostringstream oss;
    oss << currency << " " << std::fixed << std::setprecision(2) << amount;
    return oss.str();
}

} // namespace calc