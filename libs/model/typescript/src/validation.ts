import Ajv, { ValidateFunction } from 'ajv';
import { DocSet } from './DocSet';

// Import the schema - will be copied during build
import schema from './opendocs.schema.json';

/**
 * Validation result from schema validation
 */
export interface ValidationResult {
  /**
   * Whether the DocSet is valid according to the schema
   */
  valid: boolean;

  /**
   * Validation errors if invalid
   */
  errors?: Array<{
    path: string;
    message: string;
    keyword?: string;
    params?: Record<string, unknown>;
  }>;
}

// Create validator instance (singleton)
let validator: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!validator) {
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
    });
    validator = ajv.compile(schema);
  }
  return validator;
}

/**
 * Validate a DocSet against the OpenDocs JSON Schema
 *
 * This function validates the structure and types of a DocSet object
 * to ensure it conforms to the OpenDocs specification.
 *
 * @param docSet - The DocSet to validate
 * @returns Validation result with errors if invalid
 *
 * @example
 * ```typescript
 * import { validateDocSet } from '@opendocs/model';
 *
 * const docSet = loadDocumentation('./opendocs.json');
 * const result = validateDocSet(docSet);
 *
 * if (!result.valid) {
 *   console.error('Validation failed:');
 *   result.errors?.forEach(err => {
 *     console.error(`  ${err.path}: ${err.message}`);
 *   });
 * }
 * ```
 */
export function validateDocSet(docSet: unknown): ValidationResult {
  const validate = getValidator();
  const valid = validate(docSet);

  if (valid) {
    return { valid: true };
  }

  // Transform Ajv errors into a more user-friendly format
  const errors = validate.errors?.map((error) => {
    // Convert params to Record<string, unknown>
    const params = error.params as Record<string, unknown>;

    // Handle different error object types - some may not have instancePath
    const path = (error as any).instancePath || (error as any).dataPath || 'root';

    return {
      path,
      message: error.message || 'Validation error',
      keyword: error.keyword,
      params,
    };
  });

  return {
    valid: false,
    errors,
  };
}

/**
 * Validate a DocSet and throw an error if invalid
 *
 * This is a convenience function for cases where you want to
 * fail fast on invalid input.
 *
 * @param docSet - The DocSet to validate
 * @throws {Error} If validation fails
 *
 * @example
 * ```typescript
 * import { assertValidDocSet } from '@opendocs/model';
 *
 * try {
 *   const docSet = loadDocumentation('./opendocs.json');
 *   assertValidDocSet(docSet);
 *   // Proceed with valid docSet
 * } catch (error) {
 *   console.error('Invalid opendocs.json:', error.message);
 * }
 * ```
 */
export function assertValidDocSet(docSet: unknown): asserts docSet is DocSet {
  const result = validateDocSet(docSet);

  if (!result.valid) {
    const errorMessages = result.errors
      ?.map((err) => `  ${err.path}: ${err.message}`)
      .join('\n');

    throw new Error(
      `DocSet validation failed:\n${errorMessages || 'Unknown validation error'}`
    );
  }
}
