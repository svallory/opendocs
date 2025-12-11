import * as ts from 'typescript';
import { TypeReference, TypeParameter } from '@opendocs/model';

/**
 * Analyzes TypeScript types and extracts rich type information
 *
 * This class provides utilities for extracting detailed type information
 * beyond simple text representations, including:
 * - Union and intersection types
 * - Array and Promise types
 * - Generic type arguments
 * - Type parameter constraints and defaults
 */
export class TypeAnalyzer {
  constructor(private checker: ts.TypeChecker) {}

  /**
   * Analyze a TypeScript type node and extract rich type information
   */
  analyzeType(typeNode: ts.TypeNode | undefined): TypeReference | undefined {
    if (!typeNode) return undefined;

    const type = this.checker.getTypeFromTypeNode(typeNode);
    const typeName = this.checker.typeToString(type);

    const typeRef: TypeReference = {
      name: typeName,
    };

    // Check for union types (A | B)
    if (type.flags & ts.TypeFlags.Union) {
      typeRef.isUnion = true;
    }

    // Check for intersection types (A & B)
    if (type.flags & ts.TypeFlags.Intersection) {
      typeRef.isIntersection = true;
    }

    // Check for array types
    if (this.checker.isArrayType(type)) {
      typeRef.isArray = true;
    }

    // Check for Promise types
    if (this.isPromiseType(type)) {
      typeRef.isPromise = true;
    }

    // Extract type arguments (for generics like Array<T>, Promise<T>, etc.)
    const typeArgs = this.extractTypeArguments(type);
    if (typeArgs && typeArgs.length > 0) {
      typeRef.typeArguments = typeArgs;
    }

    return typeRef;
  }

  /**
   * Extract type parameters (generic parameters) with constraints and defaults
   *
   * Example: <T extends string = "default">
   */
  extractTypeParameters(
    typeParameters: readonly ts.TypeParameterDeclaration[] | undefined
  ): TypeParameter[] | undefined {
    if (!typeParameters || typeParameters.length === 0) return undefined;

    return typeParameters.map((param) => {
      const typeParam: TypeParameter = {
        name: param.name.text,
      };

      // Extract constraint (extends clause)
      if (param.constraint) {
        typeParam.constraint = this.analyzeType(param.constraint);
      }

      // Extract default type
      if (param.default) {
        typeParam.default = this.analyzeType(param.default);
      }

      return typeParam;
    });
  }

  /**
   * Check if a type is a Promise type
   */
  private isPromiseType(type: ts.Type): boolean {
    const symbol = type.getSymbol();
    return symbol?.name === 'Promise';
  }

  /**
   * Extract type arguments from a generic type
   */
  private extractTypeArguments(type: ts.Type): TypeReference[] | undefined {
    // Check if this type has type arguments
    const typeRef = type as ts.TypeReference;
    if (!typeRef.typeArguments) {
      return undefined;
    }

    return typeRef.typeArguments.map((arg) => {
      const argName = this.checker.typeToString(arg);
      const argTypeRef: TypeReference = {
        name: argName,
      };

      // Recursively check for nested type properties
      if (arg.flags & ts.TypeFlags.Union) {
        argTypeRef.isUnion = true;
      }
      if (arg.flags & ts.TypeFlags.Intersection) {
        argTypeRef.isIntersection = true;
      }
      if (this.checker.isArrayType(arg)) {
        argTypeRef.isArray = true;
      }

      return argTypeRef;
    });
  }
}
