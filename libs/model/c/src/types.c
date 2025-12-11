#include "opendocs/model/types.h"
#include <stdlib.h>
#include <string.h>

const char *opendocs_language_to_string(opendocs_language_t lang) {
    switch (lang) {
        case OPENDOCS_LANG_TYPESCRIPT: return "typescript";
        case OPENDOCS_LANG_PYTHON: return "python";
        case OPENDOCS_LANG_GO: return "go";
        case OPENDOCS_LANG_RUST: return "rust";
        case OPENDOCS_LANG_CPP: return "cpp";
        case OPENDOCS_LANG_C: return "c";
        default: return "unknown";
    }
}

const char *opendocs_item_kind_to_string(opendocs_item_kind_t kind) {
    switch (kind) {
        case OPENDOCS_KIND_FILE: return "file";
        case OPENDOCS_KIND_NAMESPACE: return "namespace";
        case OPENDOCS_KIND_MODULE: return "module";
        case OPENDOCS_KIND_CLASS: return "class";
        case OPENDOCS_KIND_INTERFACE: return "interface";
        case OPENDOCS_KIND_STRUCT: return "struct";
        case OPENDOCS_KIND_ENUM: return "enum";
        case OPENDOCS_KIND_TYPE_ALIAS: return "type-alias";
        case OPENDOCS_KIND_FUNCTION: return "function";
        case OPENDOCS_KIND_METHOD: return "method";
        case OPENDOCS_KIND_CONSTRUCTOR: return "constructor";
        case OPENDOCS_KIND_DESTRUCTOR: return "destructor";
        case OPENDOCS_KIND_FIELD: return "field";
        case OPENDOCS_KIND_PROPERTY: return "property";
        case OPENDOCS_KIND_VARIABLE: return "variable";
        case OPENDOCS_KIND_CONSTANT: return "constant";
        case OPENDOCS_KIND_PARAMETER: return "parameter";
        case OPENDOCS_KIND_TYPE_PARAMETER: return "type-parameter";
        case OPENDOCS_KIND_ENUM_MEMBER: return "enum-member";
        case OPENDOCS_KIND_TYPEDEF: return "typedef";
        case OPENDOCS_KIND_MACRO: return "macro";
        default: return "unknown";
    }
}

const char *opendocs_relation_kind_to_string(opendocs_relation_kind_t kind) {
    switch (kind) {
        case OPENDOCS_REL_CONTAINS: return "contains";
        case OPENDOCS_REL_EXTENDS: return "extends";
        case OPENDOCS_REL_IMPLEMENTS: return "implements";
        case OPENDOCS_REL_IMPORTS: return "imports";
        case OPENDOCS_REL_EXPORTS: return "exports";
        case OPENDOCS_REL_CALLS: return "calls";
        case OPENDOCS_REL_REFERENCES: return "references";
        case OPENDOCS_REL_TYPE_REFERENCES: return "type-references";
        case OPENDOCS_REL_OVERRIDES: return "overrides";
        default: return "unknown";
    }
}

/* Memory management implementations */

static void free_string_array(char **arr, size_t count) {
    if (!arr) return;
    for (size_t i = 0; i < count; i++) {
        free(arr[i]);
    }
    free(arr);
}

static void opendocs_repository_free(opendocs_repository_t *repo) {
    if (!repo) return;
    free(repo->type);
    free(repo->url);
    free(repo->directory);
    free(repo->branch);
    free(repo->tag);
    free(repo);
}

static void opendocs_location_free(opendocs_location_t *loc) {
    if (!loc) return;
    free(loc->file);
    free(loc);
}

static void opendocs_type_reference_free(opendocs_type_reference_t *type) {
    if (!type) return;
    free(type->name);
    free(type->qualified_name);
    free(type->package);
    free(type);
}

static void opendocs_parameter_free(opendocs_parameter_t *param) {
    if (!param) return;
    free(param->name);
    free(param->type);
    free(param->default_value);
    free(param->description);
}

static void opendocs_doc_tag_free(opendocs_doc_tag_t *tag) {
    if (!tag) return;
    free(tag->name);
    free(tag->value);
    free(tag->type);
}

static void opendocs_doc_block_free(opendocs_doc_block_t *block) {
    if (!block) return;
    free(block->summary);
    free(block->description);
    free(block->deprecated);
    for (size_t i = 0; i < block->tags_count; i++) {
        opendocs_doc_tag_free(&block->tags[i]);
    }
    free(block->tags);
    free(block);
}

static void opendocs_relation_free(opendocs_relation_t *rel) {
    if (!rel) return;
    free(rel->from);
    free(rel->to);
    free(rel->label);
}

void opendocs_doc_item_free(opendocs_doc_item_t *item) {
    if (!item) return;

    free(item->id);
    free(item->name);
    opendocs_doc_block_free(item->doc_block);
    opendocs_location_free(item->location);
    opendocs_type_reference_free(item->type);
    opendocs_type_reference_free(item->return_type);

    for (size_t i = 0; i < item->parameters_count; i++) {
        opendocs_parameter_free(&item->parameters[i]);
    }
    free(item->parameters);

    free_string_array(item->type_parameters, item->type_parameters_count);

    for (size_t i = 0; i < item->items_count; i++) {
        opendocs_doc_item_free(item->items[i]);
    }
    free(item->items);

    for (size_t i = 0; i < item->relations_count; i++) {
        opendocs_relation_free(&item->relations[i]);
    }
    free(item->relations);

    free(item->signature);
    free(item->accessibility);
    free(item->scope);
    free(item);
}

void opendocs_project_free(opendocs_project_t *project) {
    if (!project) return;

    free(project->id);
    free(project->name);
    free(project->description);
    free(project->language_version);
    free(project->version);
    opendocs_repository_free(project->repository);

    for (size_t i = 0; i < project->items_count; i++) {
        opendocs_doc_item_free(project->items[i]);
    }
    free(project->items);

    free_string_array(project->metadata_keys, project->metadata_count);
    free_string_array(project->metadata_values, project->metadata_count);
    free(project);
}

static void opendocs_docset_metadata_free(opendocs_docset_metadata_t *metadata) {
    if (!metadata) return;
    free(metadata->created);
    free(metadata->modified);
    if (metadata->generator) {
        free(metadata->generator->name);
        free(metadata->generator->version);
        free(metadata->generator);
    }
    free(metadata);
}

void opendocs_docset_free(opendocs_docset_t *docset) {
    if (!docset) return;

    free(docset->id);
    free(docset->name);
    free(docset->description);
    free(docset->version);
    free(docset->format);

    for (size_t i = 0; i < docset->projects_count; i++) {
        opendocs_project_free(docset->projects[i]);
    }
    free(docset->projects);

    opendocs_docset_metadata_free(docset->metadata);
    free_string_array(docset->metadata_keys, docset->metadata_count);
    free_string_array(docset->metadata_values, docset->metadata_count);
    free(docset);
}

/* JSON serialization stubs - to be implemented with a JSON library */

char *opendocs_docset_to_json(const opendocs_docset_t *docset) {
    /* TODO: Implement JSON serialization using cJSON or similar */
    (void)docset;
    return NULL;
}

opendocs_docset_t *opendocs_docset_from_json(const char *json) {
    /* TODO: Implement JSON deserialization using cJSON or similar */
    (void)json;
    return NULL;
}
