#include <iostream>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <chrono>
#include <iomanip>
#include "extractor.hpp"

namespace fs = std::filesystem;

void printUsage(const char* programName) {
    std::cout << "Usage: " << programName << " [options] <source-files...>\n";
    std::cout << "\n";
    std::cout << "Options:\n";
    std::cout << "  -o, --output <file>     Output file (default: opendocs.json)\n";
    std::cout << "  -p, --project <name>    Project name\n";
    std::cout << "  -i, --id <id>          Project ID\n";
    std::cout << "  -v, --version <ver>    Project version (default: 1.0.0)\n";
    std::cout << "  -r, --repo <url>       Repository URL\n";
    std::cout << "  -t, --repo-type <type> Repository type (default: git)\n";
    std::cout << "  -I, --include <dir>    Include directory (can be used multiple times)\n";
    std::cout << "  -D, --define <macro>   Define macro (can be used multiple times)\n";
    std::cout << "  -h, --help             Show this help message\n";
    std::cout << "  --verbose              Enable verbose output\n";
    std::cout << "\n";
    std::cout << "Example:\n";
    std::cout << "  " << programName << " -o docs.json -p MyProject -r https://github.com/user/repo src/*.cpp src/*.hpp\n";
}

struct Options {
    std::string outputFile = "opendocs.json";
    std::string projectName;
    std::string projectId;
    std::string projectVersion = "1.0.0";
    std::string repoUrl;
    std::string repoType = "git";
    std::vector<std::string> includeDirs;
    std::vector<std::string> defines;
    std::vector<std::string> sourceFiles;
    bool verbose = false;
    bool showHelp = false;
};

Options parseArguments(int argc, char* argv[]) {
    Options options;

    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];

        if (arg == "-h" || arg == "--help") {
            options.showHelp = true;
            return options;
        } else if (arg == "-o" || arg == "--output") {
            if (++i < argc) options.outputFile = argv[i];
        } else if (arg == "-p" || arg == "--project") {
            if (++i < argc) options.projectName = argv[i];
        } else if (arg == "-i" || arg == "--id") {
            if (++i < argc) options.projectId = argv[i];
        } else if (arg == "-v" || arg == "--version") {
            if (++i < argc) options.projectVersion = argv[i];
        } else if (arg == "-r" || arg == "--repo") {
            if (++i < argc) options.repoUrl = argv[i];
        } else if (arg == "-t" || arg == "--repo-type") {
            if (++i < argc) options.repoType = argv[i];
        } else if (arg == "-I" || arg == "--include") {
            if (++i < argc) options.includeDirs.push_back(argv[i]);
        } else if (arg == "-D" || arg == "--define") {
            if (++i < argc) options.defines.push_back(argv[i]);
        } else if (arg == "--verbose") {
            options.verbose = true;
        } else if (arg[0] != '-') {
            // Assume it's a source file or glob pattern
            options.sourceFiles.push_back(arg);
        } else {
            std::cerr << "Unknown option: " << arg << "\n";
            options.showHelp = true;
            return options;
        }
    }

    return options;
}

std::vector<std::string> expandGlobs(const std::vector<std::string>& patterns) {
    std::vector<std::string> files;

    for (const auto& pattern : patterns) {
        // Simple glob expansion - in a real implementation, you'd use a proper glob library
        if (pattern.find('*') != std::string::npos || pattern.find('?') != std::string::npos) {
            // For now, just add the pattern as-is
            files.push_back(pattern);
        } else if (fs::exists(pattern)) {
            if (fs::is_directory(pattern)) {
                // Add all .cpp, .hpp, .h, .cc, .cxx files in the directory
                for (const auto& entry : fs::recursive_directory_iterator(pattern)) {
                    if (entry.is_regular_file()) {
                        std::string ext = entry.path().extension().string();
                        if (ext == ".cpp" || ext == ".hpp" || ext == ".h" ||
                            ext == ".cc" || ext == ".cxx" || ext == ".c") {
                            files.push_back(entry.path().string());
                        }
                    }
                }
            } else {
                files.push_back(pattern);
            }
        }
    }

    return files;
}

int main(int argc, char* argv[]) {
    Options options = parseArguments(argc, argv);

    if (options.showHelp) {
        printUsage(argv[0]);
        return 0;
    }

    if (options.sourceFiles.empty()) {
        std::cerr << "Error: No source files specified\n";
        printUsage(argv[0]);
        return 1;
    }

    try {
        // Expand globs and collect source files
        auto sourceFiles = expandGlobs(options.sourceFiles);

        if (sourceFiles.empty()) {
            std::cerr << "Error: No source files found\n";
            return 1;
        }

        if (options.verbose) {
            std::cout << "Found " << sourceFiles.size() << " source files\n";
            for (const auto& file : sourceFiles) {
                std::cout << "  - " << file << "\n";
            }
        }

        // Set up extractor options
        opendocs::extractor::ExtractorConfig config;
        config.projectName = options.projectName.empty() ?
            fs::path(sourceFiles[0]).filename().string() : options.projectName;
        config.projectId = options.projectId.empty() ? config.projectName : options.projectId;
        config.projectVersion = options.projectVersion;
        config.repoUrl = options.repoUrl;
        config.repoType = options.repoType;
        config.includeDirs = options.includeDirs;
        config.defines = options.defines;
        config.verbose = options.verbose;

        // Create and run extractor
        auto extractor = std::make_unique<opendocs::extractor::CppExtractor>(config);
        auto docSet = extractor->extract(sourceFiles);

        // Write output
        std::ofstream outFile(options.outputFile);
        if (!outFile) {
            std::cerr << "Error: Cannot open output file " << options.outputFile << "\n";
            return 1;
        }

        // Write a simple JSON-like output for now
        outFile << "{\n";
        outFile << "  \"id\": \"" << docSet->id << "\",\n";
        outFile << "  \"name\": \"" << docSet->name << "\",\n";
        if (docSet->description) outFile << "  \"description\": \"" << *docSet->description << "\",\n";
        outFile << "  \"version\": \"" << docSet->version << "\",\n";
        if (docSet->format) outFile << "  \"format\": \"" << *docSet->format << "\",\n";
        outFile << "  \"projects\": [\n";

        for (size_t i = 0; i < docSet->projects.size(); ++i) {
            const auto& project = docSet->projects[i];
            outFile << "    {\n";
            outFile << "      \"id\": \"" << project->id << "\",\n";
            outFile << "      \"name\": \"" << project->name << "\",\n";
            if (project->description) outFile << "      \"description\": \"" << *project->description << "\",\n";
            outFile << "      \"version\": \"" << project->version << "\",\n";
            outFile << "      \"language\": \"" << opendocs::model::languageToString(project->language) << "\",\n";
            if (project->languageVersion) outFile << "      \"languageVersion\": \"" << *project->languageVersion << "\",\n";
            outFile << "      \"items\": [\n";

            for (size_t j = 0; j < project->items.size(); ++j) {
                if (j > 0) outFile << ",\n";
                outFile << "        {\n";
                outFile << "          \"id\": \"" << project->items[j]->id << "\",\n";
                outFile << "          \"name\": \"" << project->items[j]->name << "\",\n";
                outFile << "          \"kind\": \"" << opendocs::model::itemKindToString(project->items[j]->kind) << "\"\n";
                outFile << "        }";
            }

            outFile << "\n      ]\n";
            outFile << "    }";
            if (i < docSet->projects.size() - 1) outFile << ",";
            outFile << "\n";
        }

        outFile << "  ],\n";

        if (docSet->metadata) {
            outFile << "  \"metadata\": {\n";
            if (docSet->metadata->created) outFile << "    \"created\": \"" << *docSet->metadata->created << "\",\n";
            if (docSet->metadata->modified) outFile << "    \"modified\": \"" << *docSet->metadata->modified << "\",\n";
            if (docSet->metadata->generator) {
                outFile << "    \"generator\": {\n";
                outFile << "      \"name\": \"" << docSet->metadata->generator->name << "\",\n";
                outFile << "      \"version\": \"" << docSet->metadata->generator->version << "\"\n";
                outFile << "    }\n";
            }
            outFile << "  }\n";
        }

        outFile << "}\n";

        if (options.verbose) {
            std::cout << "\nDocumentation extracted successfully!\n";
            std::cout << "Output written to: " << options.outputFile << "\n";
        }

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\n";
        return 1;
    }

    return 0;
}