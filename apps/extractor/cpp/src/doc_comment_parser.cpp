#include "doc_comment_parser.hpp"
#include <algorithm>
#include <cctype>
#include <sstream>
#include <regex>

namespace opendocs {
namespace extractor {

DocCommentParser::DocCommentParser() {
    // Initialize regex patterns for different tags
    paramRegex_ = std::regex(R"(@param\s+(\w+)\s+(.+))");
    returnsRegex_ = std::regex(R"(@returns?\s+(.+))");
    throwsRegex_ = std::regex(R"(@throws?\s+(\w+)(?:\s+(.+))?)");
    seeRegex_ = std::regex(R"(@see\s+(.+))");
    sinceRegex_ = std::regex(R"(@since\s+(.+))");
    deprecatedRegex_ = std::regex(R"(@deprecated\s*(.+)?)");
    exampleRegex_ = std::regex(R"(@example\s*(.+)?)");
    noteRegex_ = std::regex(R"(@note\s+(.+))");
    warningRegex_ = std::regex(R"(@warning\s+(.+))");
    todoRegex_ = std::regex(R"(@todo\s+(.+))");
    authorRegex_ = std::regex(R"(@author\s+(.+))");
    versionRegex_ = std::regex(R"(@version\s+(.+))");

    // Doxygen-specific patterns
    briefRegex_ = std::regex(R"(@brief\s+(.+))");
    detailsRegex_ = std::regex(R"(@details\s+(.+))");
    copydocRegex_ = std::regex(R"(@copydoc\s+(.+))");
    fileRegex_ = std::regex(R"(@file\s*(.+)?)");
    classRegex_ = std::regex(R"(@class\s+(\w+))");
}

ParsedDocComment DocCommentParser::parse(const std::string& comment) {
    CommentStyle style = detectCommentStyle(comment);

    switch (style) {
        case CommentStyle::CPP_DOUBLE_SLASH:
            return parseSingleLine(comment);
        case CommentStyle::C_BLOCK:
        case CommentStyle::CPP_BLOCK:
        case CommentStyle::DOXYGEN_BLOCK:
        case CommentStyle::JAVA_DOC:
            return parseCStyle(comment);
        case CommentStyle::DOXYGEN_LINE:
            return parseSingleLine(comment);
        case CommentStyle::QT_STYLE:
            return parseCStyle(comment);
        default:
            return ParsedDocComment{};
    }
}

ParsedDocComment DocCommentParser::parseCppStyle(const std::string& comment) {
    return parseSingleLine(comment);
}

ParsedDocComment DocCommentParser::parseCStyle(const std::string& comment) {
    ParsedDocComment result;
    std::string cleaned = stripCommentMarkers(comment);

    // Split into lines
    std::vector<std::string> lines = splitIntoLines(cleaned);

    // Extract main description (lines before any tags)
    std::string description;
    bool inDescription = true;

    for (const auto& line : lines) {
        std::string trimmed = trim(line);

        // Check if this line contains a tag
        if (trimmed.find('@') == 0 || trimmed.find('\\') == 0) {
            inDescription = false;
        }

        if (inDescription && !trimmed.empty()) {
            if (!description.empty()) description += " ";
            description += trimmed;
        } else if (!inDescription) {
            // Parse tags
            if (trimmed.find('@') == 0) {
                result.tags.push_back(parseTag(trimmed));
            }
        }
    }

    result.description = description;

    // Extract summary from @brief tag if present
    std::smatch match;
    if (std::regex_search(comment, match, briefRegex_)) {
        result.summary = trim(match[1]);
    }

    // Extract deprecated info
    if (std::regex_search(comment, match, deprecatedRegex_)) {
        result.deprecated = trim(match[1]);
    }

    return result;
}

ParsedDocComment DocCommentParser::parseSingleLine(const std::string& comment) {
    ParsedDocComment result;
    std::string cleaned = stripCommentMarkers(comment);

    // Handle multiple single-line comments
    std::vector<std::string> lines = splitIntoLines(cleaned);
    std::string description;

    for (const auto& line : lines) {
        std::string trimmed = trim(line);

        // Remove leading comment markers
        if (trimmed.find("///") == 0) {
            trimmed = trim(trimmed.substr(3));
        } else if (trimmed.find("//") == 0) {
            trimmed = trim(trimmed.substr(2));
        }

        if (!trimmed.empty()) {
            if (trimmed.find('@') == 0) {
                // This is a tag
                result.tags.push_back(parseTag(trimmed));
            } else {
                // This is part of the description
                if (!description.empty()) description += " ";
                description += trimmed;
            }
        }
    }

    result.description = description;
    return result;
}

model::DocTag DocCommentParser::parseTag(const std::string& tagContent) {
    model::DocTag tag;

    // Extract tag name and value
    size_t spacePos = tagContent.find(' ');
    if (spacePos != std::string::npos) {
        tag.name = tagContent.substr(1, spacePos - 1); // Skip @
        tag.value = trim(tagContent.substr(spacePos + 1));
    } else {
        tag.name = tagContent.substr(1); // Skip @
        tag.value = "";
    }

    // Handle specific tag types
    std::smatch match;

    if (tag.name == "param" || tag.name == "param[in]" || tag.name == "param[out]" || tag.name == "param[in,out]") {
        if (std::regex_match(tag.value, match, paramRegex_)) {
            tag.value = match[1]; // parameter name
            tag.content = match[2]; // description
            if (tag.name.find("[in]") != std::string::npos) {
                tag.type = "in";
            } else if (tag.name.find("[out]") != std::string::npos) {
                tag.type = "out";
            } else if (tag.name.find("[in,out]") != std::string::npos) {
                tag.type = "in,out";
            }
            tag.name = "param";
        }
    } else if (tag.name == "return" || tag.name == "returns") {
        tag.content = tag.value;
    } else if (tag.name == "throws" || tag.name == "throw" || tag.name == "exception") {
        if (std::regex_match(tag.value, match, throwsRegex_)) {
            tag.value = match[1]; // exception type
            tag.content = match[2]; // description
        }
    } else if (tag.name == "see" || tag.name == "sa") {
        tag.content = tag.value;
    } else if (tag.name == "since") {
        tag.content = tag.value;
    } else if (tag.name == "deprecated") {
        tag.content = tag.value;
    } else if (tag.name == "example") {
        tag.content = tag.value;
        tag.language = "cpp";
    } else if (tag.name == "note") {
        tag.content = tag.value;
    } else if (tag.name == "warning") {
        tag.content = tag.value;
    } else if (tag.name == "todo") {
        tag.content = tag.value;
    } else if (tag.name == "author") {
        tag.content = tag.value;
    } else if (tag.name == "version") {
        tag.content = tag.value;
    }

    return tag;
}

std::string DocCommentParser::trim(const std::string& str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    size_t end = str.find_last_not_of(" \t\n\r");
    return str.substr(start, end - start + 1);
}

std::string DocCommentParser::extractMainDescription(const std::string& comment) {
    std::string cleaned = stripCommentMarkers(comment);
    std::vector<std::string> lines = splitIntoLines(cleaned);

    std::string description;
    for (const auto& line : lines) {
        std::string trimmed = trim(line);
        if (!trimmed.empty() && trimmed[0] != '@' && trimmed[0] != '\\') {
            if (!description.empty()) description += " ";
            description += trimmed;
        } else if (!description.empty()) {
            break;
        }
    }

    return description;
}

std::vector<std::string> DocCommentParser::splitIntoLines(const std::string& text) {
    std::vector<std::string> lines;
    std::istringstream iss(text);
    std::string line;

    while (std::getline(iss, line)) {
        lines.push_back(line);
    }

    return lines;
}

std::string DocCommentParser::stripCommentMarkers(const std::string& comment) {
    std::string result = comment;

    // Remove /* and */
    if (result.find("/*") == 0) {
        result = result.substr(2);
    }
    if (result.rfind("*/") == result.length() - 2) {
        result = result.substr(0, result.length() - 2);
    }

    // Remove leading * from each line
    std::vector<std::string> lines = splitIntoLines(result);
    for (auto& line : lines) {
        std::string trimmed = trim(line);
        if (trimmed.find('*') == 0) {
            line = trim(trimmed.substr(1));
        } else {
            line = trimmed;
        }
    }

    // Rejoin lines
    std::string stripped;
    for (const auto& line : lines) {
        if (!stripped.empty()) stripped += "\n";
        stripped += line;
    }

    return stripped;
}

DocCommentParser::CommentStyle DocCommentParser::detectCommentStyle(const std::string& comment) {
    std::string trimmed = trim(comment);

    if (trimmed.find("///") == 0) {
        return CommentStyle::DOXYGEN_LINE;
    } else if (trimmed.find("//") == 0) {
        return CommentStyle::CPP_DOUBLE_SLASH;
    } else if (trimmed.find("/**") == 0) {
        return CommentStyle::DOXYGEN_BLOCK;
    } else if (trimmed.find("/*") == 0) {
        // Could be regular C comment or JavaDoc style
        if (trimmed.find("*") != std::string::npos && comment.find("@") != std::string::npos) {
            return CommentStyle::JAVA_DOC;
        }
        return CommentStyle::C_BLOCK;
    } else if (trimmed.find("/*!") == 0) {
        return CommentStyle::QT_STYLE;
    }

    return CommentStyle::C_BLOCK;
}

bool doc_comment_utils::isDocCommentStart(const std::string& line) {
    std::string trimmed = trim(line);
    return trimmed.find("/**") == 0 ||
           trimmed.find("///") == 0 ||
           trimmed.find("/*!") == 0 ||
           (trimmed.find("/*") == 0 && trimmed.find("*") != std::string::npos);
}

bool doc_comment_utils::hasDocComment(const std::string& line) {
    return line.find("//") != std::string::npos ||
           line.find("/*") != std::string::npos;
}

std::string doc_comment_utils::extractDocComment(const std::string& line) {
    size_t pos = line.find("//");
    if (pos != std::string::npos) {
        return line.substr(pos);
    }

    pos = line.find("/*");
    if (pos != std::string::npos) {
        return line.substr(pos);
    }

    return "";
}

std::string doc_comment_utils::mergeComments(const std::vector<std::string>& comments) {
    std::string merged;
    for (const auto& comment : comments) {
        if (!merged.empty()) merged += "\n";
        merged += comment;
    }
    return merged;
}

std::string doc_comment_utils::convertToDoxygen(const std::string& comment) {
    // Simple conversion - wrap in /** */ and ensure @ tags
    std::string result = "/**\n";
    std::vector<std::string> lines = DocCommentParser().splitIntoLines(comment);

    for (const auto& line : lines) {
        std::string trimmed = trim(line);
        if (!trimmed.empty()) {
            result += " * " + trimmed + "\n";
        }
    }

    result += " */";
    return result;
}

std::string doc_comment_utils::convertFromDoxygen(const std::string& doxygenComment) {
    // Extract content between /** and */
    size_t start = doxygenComment.find("/**");
    if (start == std::string::npos) return "";

    size_t end = doxygenComment.rfind("*/");
    if (end == std::string::npos) return "";

    std::string content = doxygenComment.substr(start + 3, end - start - 3);
    return DocCommentParser().stripCommentMarkers(content);
}

std::string doc_comment_utils::extractFileDoc(const std::vector<std::string>& fileLines) {
    // Look for file-level documentation at the beginning of the file
    std::string fileDoc;

    for (const auto& line : fileLines) {
        if (trim(line).empty()) continue;

        if (isDocCommentStart(line)) {
            fileDoc = extractDocComment(line);
            break;
        }

        // Stop if we hit non-comment, non-whitespace content
        if (!hasDocComment(line) && !trim(line).empty()) {
            break;
        }
    }

    return fileDoc;
}

std::string doc_comment_utils::extractClassDoc(const std::vector<std::string>& lines, size_t classLineIndex) {
    // Look backwards for class documentation
    std::string classDoc;

    for (int i = static_cast<int>(classLineIndex) - 1; i >= 0; --i) {
        const auto& line = lines[i];
        std::string trimmed = trim(line);

        if (isDocCommentStart(line)) {
            classDoc = extractDocComment(line);
            break;
        }

        // Stop if we hit non-comment, non-whitespace content
        if (!trimmed.empty() && !hasDocComment(line)) {
            break;
        }
    }

    return classDoc;
}

std::string doc_comment_utils::extractFunctionDoc(const std::vector<std::string>& lines, size_t functionLineIndex) {
    // Look backwards for function documentation
    std::string funcDoc;

    for (int i = static_cast<int>(functionLineIndex) - 1; i >= 0; --i) {
        const auto& line = lines[i];
        std::string trimmed = trim(line);

        if (isDocCommentStart(line)) {
            funcDoc = extractDocComment(line);
            break;
        }

        // Stop if we hit non-comment, non-whitespace content
        if (!trimmed.empty() && !hasDocComment(line)) {
            break;
        }
    }

    return funcDoc;
}

} // namespace extractor
} // namespace opendocs