#include "extractor.hpp"
#include "clang_parser.hpp"
#include <filesystem>
#include <chrono>
#include <iostream>
#include <algorithm>
#include <sstream>
#include <ctime>
#include <fstream>
#include <regex>

namespace fs = std::filesystem;

namespace opendocs {
namespace extractor {

CppExtractor::CppExtractor(const ExtractorConfig& config) : config_(config) {
    // Create DocSet
    docSet_ = std::make_shared<model::DocSet>();
    docSet_->id = config_.projectId;
    docSet_->name = config_.projectName;
    docSet_->version = "0.1.0";
    docSet_->format = "json";

    // Set metadata
    model::DocSetMetadata metadata;
    auto now = std::chrono::system_clock::now();
    auto time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&time_t), "%Y-%m-%dT%H:%M:%SZ");
    metadata.created = ss.str();
    metadata.modified = ss.str();
    metadata.generator = model::DocSetMetadata::Generator{
        "opendocs-extract-cpp",
        "0.1.0"
    };
    docSet_->metadata = metadata;

    // Create Project
    project_ = std::make_shared<model::Project>();
    project_->id = config_.projectId;
    project_->name = config_.projectName;
    project_->language = model::SupportedLanguages::CPP;
    project_->version = config_.projectVersion;

    // Add repository info if provided
    if (!config_.repoUrl.empty()) {
        model::Repository repo;
        repo.type = config_.repoType;
        repo.url = config_.repoUrl;
        project_->repository = repo;
    }

    docSet_->projects.push_back(project_);
}

std::shared_ptr<model::DocSet> CppExtractor::extract(const std::vector<std::string>& sourceFiles) {
    if (config_.verbose) {
        std::cout << "Extracting documentation from " << sourceFiles.size() << " files...\n";
    }

    // Create clang parser with config
    ClangParserConfig parserConfig;
    parserConfig.includePaths = config_.includeDirs;
    parserConfig.defines = config_.defines;
    parserConfig.compilerFlags = config_.compilerFlags;
    parserConfig.verbose = config_.verbose;

    ClangParser parser(parserConfig);

    std::shared_ptr<model::DocSet> docSet;

    try {
        // Parse all files at once
        docSet = parser.parseFiles(sourceFiles);

        // Update our docSet with the parsed data
        if (!docSet->projects.empty()) {
            // Copy the first project to our project
            auto parsedProject = docSet->projects[0];
            project_->items = parsedProject->items;

            if (config_.verbose) {
                std::cout << "\nExtraction complete!\n";
                std::cout << "Total items extracted: " << project_->getItemCount() << "\n";
            }
        }

        // Return the parsed docSet
        return docSet;
    } catch (const std::exception& e) {
        std::cerr << "Error during extraction: " << e.what() << "\n";
        throw;
    }

    return docSet;
}

} // namespace extractor
} // namespace opendocs