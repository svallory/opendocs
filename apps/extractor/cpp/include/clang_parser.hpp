#pragma once

#include <string>
#include <vector>
#include <memory>
#include <clang-c/Index.h>
#include "opendocs/model/types.hpp"

namespace opendocs {
namespace extractor {

struct ClangParserConfig {
    std::vector<std::string> includePaths;
    std::vector<std::string> defines;
    std::vector<std::string> compilerFlags;
    bool verbose = false;
};

class ClangParser {
public:
    explicit ClangParser(const ClangParserConfig& config);
    ~ClangParser();

    // Parse a single file
    std::shared_ptr<model::DocSet> parseFile(const std::string& filePath);

    // Parse multiple files
    std::shared_ptr<model::DocSet> parseFiles(const std::vector<std::string>& filePaths);

private:
    ClangParserConfig config_;
    CXIndex index_;
    CXTranslationUnit translationUnit_;

    struct VisitorData {
        ClangParser* parser;
        std::vector<std::shared_ptr<model::DocItem>> items;
        std::string filePath;
    };

    // Helper methods
    std::shared_ptr<model::DocItem> parseCursor(CXCursor cursor, const std::string& filePath = "");
    std::string getCursorKindName(CXCursorKind kind);
    model::ItemKind convertCursorKind(CXCursorKind kind);
    std::string getCursorSpelling(CXCursor cursor);
    std::string getCursorDisplayName(CXCursor cursor);
    std::string getCursorUSR(CXCursor cursor);
    model::Location getCursorLocation(CXCursor cursor);
    std::string getComment(CXCursor cursor);
    std::vector<std::string> getTemplateParameters(CXCursor cursor);
    std::vector<model::Parameter> getFunctionParameters(CXCursor cursor);

    // Visitor callback for AST traversal
    static CXChildVisitResult visitorStatic(CXCursor cursor, CXCursor parent, CXClientData clientData);
    CXChildVisitResult visitor(CXCursor cursor, CXCursor parent, std::vector<std::shared_ptr<model::DocItem>>& items, const std::string& filePath);
    static CXChildVisitResult visitParameters(CXCursor cursor, CXCursor parent, CXClientData clientData);

    // Parse documentation comment
    model::DocBlock parseComment(const std::string& comment);

    // Convert CXString to std::string
    std::string convertString(CXString cxString);
};

} // namespace extractor
} // namespace opendocs