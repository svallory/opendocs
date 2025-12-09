#pragma once

#include <string>
#include <vector>
#include <memory>
#include "opendocs/model/types.hpp"

namespace opendocs {
namespace extractor {

struct ExtractorConfig {
    std::string projectName;
    std::string projectId;
    std::string projectVersion = "1.0.0";
    std::string repoUrl;
    std::string repoType = "git";
    std::vector<std::string> includeDirs;
    std::vector<std::string> defines;
    std::vector<std::string> compilerFlags;
    bool verbose = false;
};

class CppExtractor {
public:
    explicit CppExtractor(const ExtractorConfig& config);
    ~CppExtractor() = default;

    std::shared_ptr<model::DocSet> extract(const std::vector<std::string>& sourceFiles);

private:
    ExtractorConfig config_;
    std::shared_ptr<model::DocSet> docSet_;
    std::shared_ptr<model::Project> project_;

    void extractFile(const std::string& filePath);
};

} // namespace extractor
} // namespace opendocs