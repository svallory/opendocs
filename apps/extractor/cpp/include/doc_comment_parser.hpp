#pragma once

#include <string>
#include <vector>
#include <optional>
#include <regex>
#include "../../../libs/model/cpp/include/opendocs/model/types.hpp"

namespace opendocs {
namespace extractor {

struct ParsedDocComment {
    std::string description;
    std::optional<std::string> summary;
    std::optional<std::string> deprecated;
    std::vector<model::DocTag> tags;
};

class DocCommentParser {
public:
    DocCommentParser();
    ~DocCommentParser() = default;

    ParsedDocComment parse(const std::string& comment);

    // Parse specific C++ comment styles
    ParsedDocComment parseCppStyle(const std::string& comment);
    ParsedDocComment parseCStyle(const std::string& comment);
    ParsedDocComment parseSingleLine(const std::string& comment);

private:
    // Tag parsing
    std::vector<std::string> extractTags(const std::string& comment);
    model::DocTag parseTag(const std::string& tagContent);

    // Common tag patterns
    std::regex paramRegex_;
    std::regex returnsRegex_;
    std::regex throwsRegex_;
    std::regex seeRegex_;
    std::regex sinceRegex_;
    std::regex deprecatedRegex_;
    std::regex exampleRegex_;
    std::regex noteRegex_;
    std::regex warningRegex_;
    std::regex todoRegex_;
    std::regex authorRegex_;
    std::regex versionRegex_;

    // Doxygen-specific patterns
    std::regex briefRegex_;
    std::regex detailsRegex_;
    std::regex copydocRegex_;
    std::regex fileRegex_;
    std::regex classRegex_;

    // Helper methods
    std::string trim(const std::string& str);
    std::string extractMainDescription(const std::string& comment);
    std::vector<std::string> splitIntoLines(const std::string& text);
    std::string stripCommentMarkers(const std::string& comment);
    bool isDoxygenTag(const std::string& word);

    // C++ specific documentation styles
    enum class CommentStyle {
        CPP_DOUBLE_SLASH,    // // comment
        C_BLOCK,             // /* comment */
        CPP_BLOCK,           // //* comment */
        DOXYGEN_BLOCK,       // /** comment */
        DOXYGEN_LINE,        // /// comment
        QT_STYLE,            // /*! comment */
        JAVA_DOC             // /** comment */ (JavaDoc style)
    };

    CommentStyle detectCommentStyle(const std::string& comment);
};

// Utility functions for working with documentation comments
namespace doc_comment_utils {

    // Check if a line starts a documentation comment
    bool isDocCommentStart(const std::string& line);

    // Check if a line contains a documentation comment
    bool hasDocComment(const std::string& line);

    // Extract documentation comment from a line
    std::string extractDocComment(const std::string& line);

    // Merge multiple comment blocks
    std::string mergeComments(const std::vector<std::string>& comments);

    // Convert between different comment styles
    std::string convertToDoxygen(const std::string& comment);
    std::string convertFromDoxygen(const std::string& doxygenComment);

    // Extract file-level documentation
    std::string extractFileDoc(const std::vector<std::string>& fileLines);

    // Extract class-level documentation
    std::string extractClassDoc(const std::vector<std::string>& lines, size_t classLineIndex);

    // Extract function documentation (look backwards from function)
    std::string extractFunctionDoc(const std::vector<std::string>& lines, size_t functionLineIndex);
}

} // namespace extractor
} // namespace opendocs