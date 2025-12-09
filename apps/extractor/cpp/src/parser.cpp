#include "parser.hpp"
#include "doc_comment_parser.hpp"
#include <filesystem>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <regex>

namespace fs = std::filesystem;

namespace opendocs {
namespace extractor {

CppParser::CppParser() {
    // Initialize regular expressions
    includeRegex_ = std::regex(R"(#\s*include\s*[<"]([^>"]+)[>"])");
    namespaceRegex_ = std::regex(R"(\bnamespace\s+(\w+)\s*\{?)");
    classRegex_ = std::regex(R"(\b(?:class|struct)\s+(\w+))");
    functionRegex_ = std::regex(R"((?:(\w+)\s+)?(\w+)\s*\(([^)]*)\)\s*(?:const)?\s*(?:->\s*(\w+))?)");
    variableRegex_ = std::regex(R"(\b(?:const\s+)?(?:\w+::)?(\w+)\s+(\w+)\s*(?:=\s*(.+))?;)");
    enumRegex_ = std::regex(R"(\benum\s+(?:class\s+)?(\w+))");
    typedefRegex_ = std::regex(R"(\b(?:typedef|using)\s+(\w+)\s*=\s*(.+);)");
    macroRegex_ = std::regex(R"(#\s*define\s+(\w+)(?:\(([^)]*)\))?\s*(.*))");
    docCommentRegex_ = std::regex(R"(/\*\*([^*]|\*(?!/))*\*/)");
    templateRegex_ = std::regex(R"(template\s*<([^>]+)>)");
}

ParsedFile CppParser::parseFile(const std::string& filePath) {
    ParsedFile result;
    result.path = filePath;

    // Read file content
    std::ifstream file(filePath);
    if (!file.is_open()) {
        throw std::runtime_error("Cannot open file: " + filePath);
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    fileContent_ = buffer.str();

    // Split into lines
    std::istringstream iss(fileContent_);
    std::string line;
    while (std::getline(iss, line)) {
        lines_.push_back(line);
    }

    // Preprocess (remove comments, etc.)
    preprocessFile();

    // Parse line by line
    for (size_t i = 0; i < lines_.size(); ++i) {
        const auto& line = lines_[i];

        // Skip empty lines
        if (trim(line).empty()) continue;

        // Extract doc comment before the current line
        std::string docComment = extractDocComment(i);

        // Try to parse different constructs
        if (auto include = parseInclude(line)) {
            result.includes.push_back(include->path);
        }
        else if (auto ns = parseNamespace(line, i)) {
            // Handle namespace
            namespaceStack_.push_back(ns->name);
            currentNamespace_ = getCurrentNamespace();

            // Create namespace item
            auto nsItem = std::make_shared<model::DocItem>();
            nsItem->id = buildQualifiedName("namespace:" + ns->name);
            nsItem->name = ns->name;
            nsItem->kind = model::ItemKind::NAMESPACE;
            nsItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};

            if (!ns->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(ns->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                nsItem->docBlock = docBlock;
            }

            result.items.push_back(nsItem);
        }
        else if (auto cls = parseClass(line, i)) {
            // Create class item
            auto clsItem = std::make_shared<model::DocItem>();
            clsItem->id = buildQualifiedName("class:" + cls->name);
            clsItem->name = cls->name;
            clsItem->kind = cls->isStruct ? model::ItemKind::STRUCT : model::ItemKind::CLASS;
            clsItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};
            clsItem->access = cls->access;

            if (!cls->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(cls->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                clsItem->docBlock = docBlock;
            }

            result.items.push_back(clsItem);
        }
        else if (auto func = parseFunction(line, i)) {
            // Create function item
            auto funcItem = std::make_shared<model::DocItem>();
            funcItem->id = buildQualifiedName("function:" + func->name);
            funcItem->name = func->name;
            funcItem->kind = model::ItemKind::FUNCTION;
            funcItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};
            funcItem->returnType = model::TypeReference{func->returnType, func->returnType, std::nullopt};
            funcItem->parameters = func->parameters;
            funcItem->typeParameters = func->templateParams;
            funcItem->isStatic = func->isStatic;
            funcItem->access = func->access;

            if (!func->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(func->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                funcItem->docBlock = docBlock;
            }

            result.items.push_back(funcItem);
        }
        else if (auto var = parseVariable(line, i)) {
            // Create variable item
            auto varItem = std::make_shared<model::DocItem>();
            varItem->id = buildQualifiedName("variable:" + var->name);
            varItem->name = var->name;
            varItem->kind = var->isConst ? model::ItemKind::CONSTANT : model::ItemKind::VARIABLE;
            varItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};
            varItem->type = model::TypeReference{var->type, var->type, std::nullopt};
            varItem->isStatic = var->isStatic;
            varItem->access = var->access;

            if (!var->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(var->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                varItem->docBlock = docBlock;
            }

            result.items.push_back(varItem);
        }
        else if (auto en = parseEnum(line, i)) {
            // Create enum item
            auto enumItem = std::make_shared<model::DocItem>();
            enumItem->id = buildQualifiedName("enum:" + en->name);
            enumItem->name = en->name;
            enumItem->kind = model::ItemKind::ENUM;
            enumItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};

            if (!en->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(en->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                enumItem->docBlock = docBlock;
            }

            // Add enum members
            for (const auto& [valueName, value] : en->values) {
                auto memberItem = std::make_shared<model::DocItem>();
                memberItem->id = enumItem->id + "#" + valueName;
                memberItem->name = valueName;
                memberItem->kind = model::ItemKind::ENUM_MEMBER;
                memberItem->scope = enumItem->id;
                enumItem->items.push_back(memberItem);
            }

            result.items.push_back(enumItem);
        }
        else if (auto td = parseTypedef(line, i)) {
            // Create typedef item
            auto tdItem = std::make_shared<model::DocItem>();
            tdItem->id = buildQualifiedName("typedef:" + td->name);
            tdItem->name = td->name;
            tdItem->kind = td->isUsing ? model::ItemKind::TYPE_ALIAS : model::ItemKind::TYPEDEF;
            tdItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};
            tdItem->type = model::TypeReference{td->type, td->type, std::nullopt};

            if (!td->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(td->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                tdItem->docBlock = docBlock;
            }

            result.items.push_back(tdItem);
        }
        else if (auto macro = parseMacro(line, i)) {
            // Create macro item
            auto macroItem = std::make_shared<model::DocItem>();
            macroItem->id = buildQualifiedName("macro:" + macro->name);
            macroItem->name = macro->name;
            macroItem->kind = model::ItemKind::MACRO;
            macroItem->location = model::Location{filePath, static_cast<int>(i + 1), 1};

            if (!macro->docComment.empty()) {
                DocCommentParser parser;
                auto parsed = parser.parse(macro->docComment);
                model::DocBlock docBlock;
                docBlock.description = parsed.description;
                docBlock.summary = parsed.summary;
                docBlock.deprecated = parsed.deprecated;
                docBlock.tags = parsed.tags;
                macroItem->docBlock = docBlock;
            }

            result.items.push_back(macroItem);
        }
    }

    // Clean up namespace stack
    namespaceStack_.clear();
    currentNamespace_.clear();

    return result;
}

void CppParser::preprocessFile() {
    // Simple preprocessing - remove single-line comments and handle multi-line comments
    bool inMultiLineComment = false;

    for (auto& line : lines_) {
        std::string processed;
        bool inString = false;
        char stringDelimiter = '\0';

        for (size_t i = 0; i < line.length(); ++i) {
            char c = line[i];

            // Handle string literals
            if (!inMultiLineComment) {
                if ((c == '"' || c == '\'') && (i == 0 || line[i-1] != '\\')) {
                    if (!inString) {
                        inString = true;
                        stringDelimiter = c;
                    } else if (c == stringDelimiter) {
                        inString = false;
                    }
                }
            }

            // Handle comments
            if (!inString) {
                if (!inMultiLineComment && i + 1 < line.length()) {
                    if (line[i] == '/' && line[i+1] == '*') {
                        inMultiLineComment = true;
                        ++i; // Skip next character
                        continue;
                    } else if (line[i] == '/' && line[i+1] == '/') {
                        // Single-line comment, ignore rest of line
                        break;
                    }
                }

                if (inMultiLineComment && i + 1 < line.length()) {
                    if (line[i] == '*' && line[i+1] == '/') {
                        inMultiLineComment = false;
                        ++i; // Skip next character
                        continue;
                    }
                }
            }

            if (!inMultiLineComment) {
                processed += c;
            }
        }

        line = processed;
    }
}

std::string CppParser::extractDocComment(size_t lineIndex) {
    // Look backwards for documentation comments
    std::string comment;
    bool foundComment = false;

    // Skip current line and look at previous lines
    for (int i = static_cast<int>(lineIndex) - 1; i >= 0; --i) {
        const auto& line = lines_[i];
        std::string trimmed = trim(line);

        // Check for Doxygen-style comments
        if (trimmed.find("/**") == 0 || trimmed.find("///") == 0) {
            // Multi-line comment
            if (trimmed.find("/**") == 0) {
                // Look for the start of multi-line comment
                int startIdx = i;
                for (; startIdx >= 0; --startIdx) {
                    if (lines_[startIdx].find("/**") != std::string::npos) {
                        break;
                    }
                }

                // Extract the entire comment
                for (int j = startIdx; j <= i; ++j) {
                    comment += lines_[j] + "\n";
                }
                foundComment = true;
                break;
            }
            // Single-line comment
            else if (trimmed.find("///") == 0) {
                comment = line;
                foundComment = true;
                break;
            }
        }
        // Check for regular C-style comments that might be documentation
        else if (trimmed.find("/*") == 0) {
            comment = line;
            foundComment = true;
            break;
        }
        // Check for C++ style comments
        else if (trimmed.find("//") == 0 && trimmed.length() > 2) {
            // Only consider if it's likely documentation (has @tag or similar)
            if (trimmed.find("@") != std::string::npos ||
                trimmed.find("\\") != std::string::npos) {
                comment = line;
                foundComment = true;
                break;
            }
        }
        // If we hit a non-comment line, stop looking
        else if (!trimmed.empty() && trimmed[0] != '/' && foundComment) {
            break;
        }
    }

    return comment;
}

IncludeInfo CppParser::parseInclude(const std::string& line) {
    std::smatch match;
    if (std::regex_search(line, match, includeRegex_)) {
        IncludeInfo info;
        info.path = match[1];
        info.isSystem = line.find('<') != std::string::npos;
        info.rawText = match[0];
        return info;
    }
    return IncludeInfo{};
}

NamespaceInfo CppParser::parseNamespace(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, namespaceRegex_)) {
        NamespaceInfo info;
        info.name = match[1];
        return info;
    }
    return NamespaceInfo{};
}

ClassInfo CppParser::parseClass(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, classRegex_)) {
        ClassInfo info;
        info.name = match[1];
        info.lineNumber = lineIndex + 1;
        info.isStruct = line.find("struct") != std::string::npos;

        // Check for template
        std::smatch templateMatch;
        if (std::regex_search(line, templateMatch, templateRegex_)) {
            info.isTemplate = true;
            info.templateParams = split(templateMatch[1], ',');
        }

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        return info;
    }
    return ClassInfo{};
}

FunctionInfo CppParser::parseFunction(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, functionRegex_)) {
        FunctionInfo info;
        info.returnType = match[1];
        info.name = match[2];
        info.lineNumber = lineIndex + 1;

        // Parse parameters
        std::string paramList = match[3];
        info.parameters = parseParameters(paramList);

        // Check for template
        std::smatch templateMatch;
        if (std::regex_search(line, templateMatch, templateRegex_)) {
            info.isTemplate = true;
            std::string params = templateMatch[1];
            std::vector<std::string> paramNames = split(params, ',');
            for (const auto& param : paramNames) {
                model::TypeParameter tp;
                tp.name = trim(param);
                info.templateParams.push_back(tp);
            }
        }

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        return info;
    }
    return FunctionInfo{};
}

VariableInfo CppParser::parseVariable(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, variableRegex_)) {
        VariableInfo info;
        info.type = match[1];
        info.name = match[2];
        if (match.size() > 3) {
            info.value = match[3];
        }
        info.lineNumber = lineIndex + 1;
        info.isConst = line.find("const") != std::string::npos;
        info.isConstexpr = line.find("constexpr") != std::string::npos;
        info.isStatic = line.find("static") != std::string::npos;

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        return info;
    }
    return VariableInfo{};
}

EnumInfo CppParser::parseEnum(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, enumRegex_)) {
        EnumInfo info;
        info.name = match[1];
        info.lineNumber = lineIndex + 1;

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        // Simple enum value parsing (would need to be more sophisticated)
        // For now, just look for values in the line
        size_t bracePos = line.find('{');
        if (bracePos != std::string::npos) {
            size_t closeBracePos = line.find('}', bracePos);
            if (closeBracePos != std::string::npos) {
                std::string valuesStr = line.substr(bracePos + 1, closeBracePos - bracePos - 1);
                std::vector<std::string> values = split(valuesStr, ',');
                for (const auto& value : values) {
                    std::string trimmed = trim(value);
                    if (!trimmed.empty()) {
                        // Simple name extraction
                        std::string name = trimmed;
                        size_t eqPos = name.find('=');
                        if (eqPos != std::string::npos) {
                            name = trim(name.substr(0, eqPos));
                        }
                        info.values.push_back({name, std::nullopt});
                    }
                }
            }
        }

        return info;
    }
    return EnumInfo{};
}

TypedefInfo CppParser::parseTypedef(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, typedefRegex_)) {
        TypedefInfo info;
        info.name = match[1];
        info.type = match[2];
        info.lineNumber = lineIndex + 1;
        info.isUsing = line.find("using") != std::string::npos;

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        return info;
    }
    return TypedefInfo{};
}

MacroInfo CppParser::parseMacro(const std::string& line, size_t lineIndex) {
    std::smatch match;
    if (std::regex_search(line, match, macroRegex_)) {
        MacroInfo info;
        info.name = match[1];
        if (match.size() > 2) {
            std::string params = match[2];
            info.parameters = split(params, ',');
        }
        if (match.size() > 3) {
            info.value = match[3];
        }
        info.lineNumber = lineIndex + 1;

        // Extract doc comment
        info.docComment = extractDocComment(lineIndex);

        return info;
    }
    return MacroInfo{};
}

// Helper methods
std::string CppParser::trim(const std::string& str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    if (start == std::string::npos) return "";
    size_t end = str.find_last_not_of(" \t\n\r");
    return str.substr(start, end - start + 1);
}

std::vector<std::string> CppParser::split(const std::string& str, char delimiter) {
    std::vector<std::string> result;
    std::stringstream ss(str);
    std::string item;

    while (std::getline(ss, item, delimiter)) {
        result.push_back(trim(item));
    }

    return result;
}

std::string CppParser::join(const std::vector<std::string>& parts, const std::string& delimiter) {
    if (parts.empty()) return "";

    std::string result = parts[0];
    for (size_t i = 1; i < parts.size(); ++i) {
        result += delimiter + parts[i];
    }
    return result;
}

bool CppParser::isAccessSpecifier(const std::string& word) {
    return word == "public" || word == "private" || word == "protected";
}

std::string CppParser::extractTemplateParams(const std::string& line) {
    size_t start = line.find('<');
    if (start == std::string::npos) return "";

    size_t end = line.rfind('>');
    if (end == std::string::npos) return "";

    return line.substr(start + 1, end - start - 1);
}

std::vector<model::Parameter> CppParser::parseParameters(const std::string& paramList) {
    std::vector<model::Parameter> params;

    if (paramList.empty() || trim(paramList) == "void") {
        return params;
    }

    std::vector<std::string> paramStrs = split(paramList, ',');
    for (const auto& paramStr : paramStrs) {
        model::Parameter param;

        // Simple parsing - would need to be more sophisticated
        std::string trimmed = trim(paramStr);

        // Check for default value
        size_t eqPos = trimmed.find('=');
        if (eqPos != std::string::npos) {
            param.defaultValue = trim(trimmed.substr(eqPos + 1));
            trimmed = trim(trimmed.substr(0, eqPos));
        }

        // Extract type and name (simple approach)
        std::vector<std::string> parts = split(trimmed, ' ');
        if (parts.size() >= 2) {
            param.type = join(std::vector<std::string>(parts.begin(), parts.end() - 1), " ");
            param.name = parts.back();
        }

        params.push_back(param);
    }

    return params;
}

std::string CppParser::getCurrentNamespace() const {
    return join(namespaceStack_, "::");
}

std::string CppParser::buildQualifiedName(const std::string& name) const {
    if (currentNamespace_.empty()) {
        return name;
    }
    return currentNamespace_ + "::" + name;
}

} // namespace extractor
} // namespace opendocs