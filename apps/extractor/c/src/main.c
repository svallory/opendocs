#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <getopt.h>
#include "extractor.h"

static void print_usage(const char *program_name) {
    printf("Usage: %s [OPTIONS] <source-files...>\n", program_name);
    printf("\nOptions:\n");
    printf("  -o, --output FILE    Output file path (default: opendocs.json)\n");
    printf("  -p, --project NAME   Project name\n");
    printf("  -v, --version VER    Project version\n");
    printf("  -h, --help           Show this help message\n");
    printf("\nExample:\n");
    printf("  %s -o docs.json -p mylib -v 1.0.0 src/*.c include/*.h\n", program_name);
}

int main(int argc, char *argv[]) {
    const char *output_file = "opendocs.json";
    const char *project_name = NULL;
    const char *project_version = "0.1.0";

    static struct option long_options[] = {
        {"output",  required_argument, 0, 'o'},
        {"project", required_argument, 0, 'p'},
        {"version", required_argument, 0, 'v'},
        {"help",    no_argument,       0, 'h'},
        {0, 0, 0, 0}
    };

    int opt;
    int option_index = 0;

    while ((opt = getopt_long(argc, argv, "o:p:v:h", long_options, &option_index)) != -1) {
        switch (opt) {
            case 'o':
                output_file = optarg;
                break;
            case 'p':
                project_name = optarg;
                break;
            case 'v':
                project_version = optarg;
                break;
            case 'h':
                print_usage(argv[0]);
                return 0;
            default:
                print_usage(argv[0]);
                return 1;
        }
    }

    if (optind >= argc) {
        fprintf(stderr, "Error: No source files specified\n\n");
        print_usage(argv[0]);
        return 1;
    }

    if (!project_name) {
        fprintf(stderr, "Error: Project name is required (use -p or --project)\n\n");
        print_usage(argv[0]);
        return 1;
    }

    /* Collect source files */
    int file_count = argc - optind;
    const char **source_files = (const char **)&argv[optind];

    /* Initialize extractor context */
    opendocs_extractor_ctx_t *ctx = opendocs_extractor_init();
    if (!ctx) {
        fprintf(stderr, "Error: Failed to initialize extractor\n");
        return 1;
    }

    /* Set project information */
    opendocs_extractor_set_project_info(ctx, project_name, project_version);

    /* Process each source file */
    for (int i = 0; i < file_count; i++) {
        printf("Processing: %s\n", source_files[i]);
        if (opendocs_extractor_process_file(ctx, source_files[i]) != 0) {
            fprintf(stderr, "Warning: Failed to process %s\n", source_files[i]);
        }
    }

    /* Generate output */
    printf("Generating output to: %s\n", output_file);
    if (opendocs_extractor_write_output(ctx, output_file) != 0) {
        fprintf(stderr, "Error: Failed to write output file\n");
        opendocs_extractor_free(ctx);
        return 1;
    }

    /* Cleanup */
    opendocs_extractor_free(ctx);

    printf("Documentation extraction complete!\n");
    return 0;
}
