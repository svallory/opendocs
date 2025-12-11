#ifndef OPENDOCS_EXTRACTOR_H
#define OPENDOCS_EXTRACTOR_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Opaque extractor context structure
 */
typedef struct opendocs_extractor_ctx opendocs_extractor_ctx_t;

/**
 * Initialize a new extractor context
 *
 * @return New extractor context, or NULL on failure
 */
opendocs_extractor_ctx_t *opendocs_extractor_init(void);

/**
 * Set project information
 *
 * @param ctx Extractor context
 * @param project_name Project name
 * @param project_version Project version
 */
void opendocs_extractor_set_project_info(
    opendocs_extractor_ctx_t *ctx,
    const char *project_name,
    const char *project_version
);

/**
 * Process a C source file
 *
 * @param ctx Extractor context
 * @param file_path Path to the source file
 * @return 0 on success, non-zero on error
 */
int opendocs_extractor_process_file(
    opendocs_extractor_ctx_t *ctx,
    const char *file_path
);

/**
 * Write extracted documentation to output file
 *
 * @param ctx Extractor context
 * @param output_path Path to output JSON file
 * @return 0 on success, non-zero on error
 */
int opendocs_extractor_write_output(
    opendocs_extractor_ctx_t *ctx,
    const char *output_path
);

/**
 * Free extractor context and all associated resources
 *
 * @param ctx Extractor context to free
 */
void opendocs_extractor_free(opendocs_extractor_ctx_t *ctx);

#ifdef __cplusplus
}
#endif

#endif /* OPENDOCS_EXTRACTOR_H */
