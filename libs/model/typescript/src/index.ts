/**
 * @opendocs/model - Universal documentation model for OpenDocs
 *
 * This library provides the core types and utilities for working with OpenDocs
 * documentation. It implements the OpenDocs specification's six core models:
 *
 * - DocSet: The root object (opendocs.json file)
 * - Project: Individual projects in a monorepo with repository information
 * - DocItem: Universal element representing any documentable code with source locations
 * - DocBlock: Structured documentation content
 * - DocTag: Individual documentation tags
 * - Relation: Flexible relationship model for code relationships
 *
 * @packageDocumentation
 */

// Core models
export type { DocSet } from './DocSet';
export type { Project, Repository } from './Project';
export type { DocItem, Location, Parameter, TypeParameter, TypeReference } from './DocItem';
export type { Relation, Relations } from './Relation';
export type { DocBlock } from './DocBlock';
export type { DocTag } from './DocTag';

// Utilities
export { DocSetUtils } from './DocSet';
export { ProjectUtils, SupportedLanguages } from './Project';
export { DocItemUtils, ItemKind } from './DocItem';
export { RelationUtils, RelationKind } from './Relation';
export { DocBlockUtils } from './DocBlock';
export { CommonTags } from './DocTag';

// Version
export const VERSION = '0.2.0';
export const SPEC_VERSION = '0.2.0';
