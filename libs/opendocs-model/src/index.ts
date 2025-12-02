/**
 * @opendocs/model - Universal documentation model for OpenDocs
 *
 * This library provides the core types and utilities for working with OpenDocs
 * documentation. It implements the OpenDocs specification's five core models:
 *
 * - DocSet: The root object (opendocs.json file)
 * - Project: Individual projects in a monorepo
 * - DocItem: Universal element representing any documentable code
 * - DocBlock: Structured documentation content
 * - DocTag: Individual documentation tags
 *
 * @packageDocumentation
 */

// Core models
export type { DocSet } from './DocSet';
export type { Project } from './Project';
export type { DocItem, Parameter, TypeParameter, TypeReference } from './DocItem';
export type { ContainerRef } from './ContainerRef';
export type { DocBlock } from './DocBlock';
export type { DocTag } from './DocTag';

// Utilities
export { DocSetUtils } from './DocSet';
export { ProjectUtils, SupportedLanguages } from './Project';
export { DocItemUtils, ItemKind } from './DocItem';
export { ContainerRefUtils } from './ContainerRef';
export { DocBlockUtils } from './DocBlock';
export { CommonTags } from './DocTag';

// Version
export const VERSION = '0.1.0';
export const SPEC_VERSION = '0.1.0';
