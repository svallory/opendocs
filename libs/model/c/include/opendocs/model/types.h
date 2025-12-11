#ifndef OPENDOCS_MODEL_TYPES_H
#define OPENDOCS_MODEL_TYPES_H

#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Supported programming languages in OpenDocs
 */
typedef enum {
    OPENDOCS_LANG_TYPESCRIPT,
    OPENDOCS_LANG_PYTHON,
    OPENDOCS_LANG_GO,
    OPENDOCS_LANG_RUST,
    OPENDOCS_LANG_CPP,
    OPENDOCS_LANG_C
} opendocs_language_t;

/**
 * Kind of documented item
 */
typedef enum {
    OPENDOCS_KIND_FILE,
    OPENDOCS_KIND_NAMESPACE,
    OPENDOCS_KIND_MODULE,
    OPENDOCS_KIND_CLASS,
    OPENDOCS_KIND_INTERFACE,
    OPENDOCS_KIND_STRUCT,
    OPENDOCS_KIND_ENUM,
    OPENDOCS_KIND_TYPE_ALIAS,
    OPENDOCS_KIND_FUNCTION,
    OPENDOCS_KIND_METHOD,
    OPENDOCS_KIND_CONSTRUCTOR,
    OPENDOCS_KIND_DESTRUCTOR,
    OPENDOCS_KIND_FIELD,
    OPENDOCS_KIND_PROPERTY,
    OPENDOCS_KIND_VARIABLE,
    OPENDOCS_KIND_CONSTANT,
    OPENDOCS_KIND_PARAMETER,
    OPENDOCS_KIND_TYPE_PARAMETER,
    OPENDOCS_KIND_ENUM_MEMBER,
    OPENDOCS_KIND_TYPEDEF,
    OPENDOCS_KIND_MACRO,
    OPENDOCS_KIND_UNKNOWN
} opendocs_item_kind_t;

/**
 * Kind of relationship between items
 */
typedef enum {
    OPENDOCS_REL_CONTAINS,
    OPENDOCS_REL_EXTENDS,
    OPENDOCS_REL_IMPLEMENTS,
    OPENDOCS_REL_IMPORTS,
    OPENDOCS_REL_EXPORTS,
    OPENDOCS_REL_CALLS,
    OPENDOCS_REL_REFERENCES,
    OPENDOCS_REL_TYPE_REFERENCES,
    OPENDOCS_REL_OVERRIDES,
    OPENDOCS_REL_UNKNOWN
} opendocs_relation_kind_t;

/**
 * Repository information
 */
typedef struct {
    char *type;
    char *url;
    char *directory;      /* nullable */
    char *branch;         /* nullable */
    char *tag;            /* nullable */
} opendocs_repository_t;

/**
 * Source location information
 */
typedef struct {
    char *file;
    int line;
    int column;
} opendocs_location_t;

/**
 * Type reference information
 */
typedef struct {
    char *name;
    char *qualified_name;
    char *package;        /* nullable */
} opendocs_type_reference_t;

/**
 * Function/method parameter
 */
typedef struct {
    char *name;
    char *type;
    char *default_value;  /* nullable */
    char *description;    /* nullable */
    bool optional;
    bool rest;
} opendocs_parameter_t;

/**
 * Documentation tag (@param, @returns, etc.)
 */
typedef struct {
    char *name;
    char *value;
    char *type;           /* nullable */
} opendocs_doc_tag_t;

/**
 * Documentation block
 */
typedef struct {
    char *summary;        /* nullable */
    char *description;    /* nullable */
    char *deprecated;     /* nullable */
    opendocs_doc_tag_t *tags;
    size_t tags_count;
} opendocs_doc_block_t;

/**
 * Relationship between items
 */
typedef struct {
    char *from;
    char *to;
    opendocs_relation_kind_t kind;
    char *label;          /* nullable */
} opendocs_relation_t;

/**
 * Forward declaration for recursive structure
 */
typedef struct opendocs_doc_item opendocs_doc_item_t;

/**
 * Documented code item
 */
struct opendocs_doc_item {
    char *id;
    char *name;
    opendocs_item_kind_t kind;
    opendocs_doc_block_t *doc_block;     /* nullable */
    opendocs_location_t *location;       /* nullable */
    opendocs_type_reference_t *type;     /* nullable */
    opendocs_type_reference_t *return_type; /* nullable */
    opendocs_parameter_t *parameters;
    size_t parameters_count;
    char **type_parameters;
    size_t type_parameters_count;
    opendocs_doc_item_t **items;         /* child items */
    size_t items_count;
    opendocs_relation_t *relations;
    size_t relations_count;
    char *signature;      /* nullable */
    char *accessibility;  /* nullable */
    char *scope;          /* nullable */
    bool optional;
    bool is_static;
    bool readonly;
    bool abstract;
    bool is_async;
    bool generator;
};

/**
 * Generator metadata
 */
typedef struct {
    char *name;
    char *version;
} opendocs_generator_t;

/**
 * DocSet metadata
 */
typedef struct {
    char *created;        /* nullable */
    char *modified;       /* nullable */
    opendocs_generator_t *generator; /* nullable */
} opendocs_docset_metadata_t;

/**
 * Project information
 */
typedef struct {
    char *id;
    char *name;
    char *description;    /* nullable */
    opendocs_language_t language;
    char *language_version; /* nullable */
    char *version;
    opendocs_repository_t *repository; /* nullable */
    opendocs_doc_item_t **items;
    size_t items_count;
    /* metadata as key-value pairs */
    char **metadata_keys;
    char **metadata_values;
    size_t metadata_count;
} opendocs_project_t;

/**
 * Complete documentation set
 */
typedef struct {
    char *id;
    char *name;
    char *description;    /* nullable */
    char *version;
    char *format;         /* nullable */
    opendocs_project_t **projects;
    size_t projects_count;
    opendocs_docset_metadata_t *metadata; /* nullable */
    /* additional metadata as key-value pairs */
    char **metadata_keys;
    char **metadata_values;
    size_t metadata_count;
} opendocs_docset_t;

/* Helper functions */
const char *opendocs_language_to_string(opendocs_language_t lang);
const char *opendocs_item_kind_to_string(opendocs_item_kind_t kind);
const char *opendocs_relation_kind_to_string(opendocs_relation_kind_t kind);

/* Memory management functions */
void opendocs_docset_free(opendocs_docset_t *docset);
void opendocs_project_free(opendocs_project_t *project);
void opendocs_doc_item_free(opendocs_doc_item_t *item);

/* JSON serialization functions */
char *opendocs_docset_to_json(const opendocs_docset_t *docset);
opendocs_docset_t *opendocs_docset_from_json(const char *json);

#ifdef __cplusplus
}
#endif

#endif /* OPENDOCS_MODEL_TYPES_H */
