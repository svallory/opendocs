/**
 * A simple calculator class for testing
 */
export class Calculator {
  /**
   * Add two numbers together
   * @param a - First number
   * @param b - Second number
   * @returns The sum of a and b
   */
  add(a: number, b: number): number {
    return a + b;
  }

  /**
   * Subtract b from a
   * @param a - Number to subtract from
   * @param b - Number to subtract
   * @returns The difference
   */
  subtract(a: number, b: number): number {
    return a - b;
  }

  /**
   * PI constant
   */
  static readonly PI = 3.14159;
}

/**
 * Configuration options for the library
 */
export interface Config {
  /**
   * Enable debug mode
   */
  debug: boolean;

  /**
   * Maximum number of retries
   */
  maxRetries?: number;

  /**
   * Timeout in milliseconds
   */
  timeout: number;
}

/**
 * Log levels enumeration
 */
export enum LogLevel {
  /** Debug level logging */
  DEBUG = 0,
  /** Info level logging */
  INFO = 1,
  /** Warning level logging */
  WARN = 2,
  /** Error level logging */
  ERROR = 3,
}

/**
 * Result type for operations
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Greet a user by name
 * @param name - Name of the person to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `${currency} ${amount.toFixed(2)}`;
}
