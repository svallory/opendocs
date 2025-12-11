#pragma once

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <regex>
#include "../../../libs/model/cpp/include/opendocs/model/types.hpp"

namespace opendocs {
namespace extractor {

struct ParsedFile {
    std::string path;
    std::vector<std::shared_ptr<model::DocItem>> items;
    std::vector<std::string> includes;
    std::vector<std::string> namespaces;
    std::string packageName;
};

struct IncludeInfo {
    std::string path;
    bool isSystem;  // <iostream> vs "myheader.h"
    std::string rawText;
};

struct NamespaceInfo {
    std::string name;
    std::vector<std::shared_ptr<model::DocItem>> items;
    std::string docComment;
};

struct ClassInfo {
    std::string name;
    std::string access;  // public, private, protected
    bool isStruct;
    bool isTemplate;
    std::vector<std::string> templateParams;
    std::string baseClass;
    std::vector<std::string> interfaces;
    std::string docComment;
    std::vector<std::shared_ptr<model::DocItem>> members;
    int lineNumber;
};

struct FunctionInfo {
    std::string name;
    std::string returnType;
    std::vector<model::Parameter> parameters;
    std::vector<model::TypeParameter> templateParams;
    bool isTemplate;
    bool isStatic;
    bool isVirtual;
    bool isPureVirtual;
    std::string access;
    std::string docComment;
    int lineNumber;
};

struct VariableInfo {
    std::string name;
    std::string type;
    std::string value;
    bool isStatic;
    bool isConst;
    bool isConstexpr;
    std::string access;
    std::string docComment;
    int lineNumber;
};

struct EnumInfo {
    std::string name;
    std::string underlyingType;
    std::vector<std::pair<std::string, std::optional<int>>> values;
    std::string docComment;
    int lineNumber;
};

struct TypedefInfo {
    std::string name;
    std::string type;
    bool isUsing;  // using vs typedef
    std::string docComment;
    int lineNumber;
};

struct MacroInfo {
    std::string name;
    std::vector<std::string> parameters;
    std::string value;
    std::string docComment;
    int lineNumber;
};

class CppParser {
public:
    CppParser();
    ~CppParser() = default;

    ParsedFile parseFile(const std::string& filePath);

private:
    std::string fileContent_;
    std::vector<std::string> lines_;
    std::string currentNamespace_;
    std::vector<std::string> namespaceStack_;
    std::unordered_map<std::string, std::string> macros_;

    // Parsing methods
    void preprocessFile();
    std::string extractDocComment(size_t lineIndex);
    IncludeInfo parseInclude(const std::string& line);
    NamespaceInfo parseNamespace(const std::string& line, size_t lineIndex);
    ClassInfo parseClass(const std::string& line, size_t lineIndex);
    FunctionInfo parseFunction(const std::string& line, size_t lineIndex);
    VariableInfo parseVariable(const std::string& line, size_t lineIndex);
    EnumInfo parseEnum(const std::string& line, size_t lineIndex);
    TypedefInfo parseTypedef(const std::string& line, size_t lineIndex);
    MacroInfo parseMacro(const std::string& line, size_t lineIndex);

    // Helper methods
    std::string trim(const std::string& str);
    std::vector<std::string> split(const std::string& str, char delimiter);
    std::string join(const std::vector<std::string>& parts, const std::string& delimiter);
    bool isAccessSpecifier(const std::string& word);
    std::string extractTemplateParams(const std::string& line);
    std::vector<model::Parameter> parseParameters(const std::string& paramList);
    std::string getCurrentNamespace() const;
    std::string buildQualifiedName(const std::string& name) const;

    // Regular expressions
    std::regex includeRegex_;
    std::regex namespaceRegex_;
    std::regex classRegex_;
    std::regex functionRegex_;
    std::regex variableRegex_;
    std::regex enumRegex_;
    std::regex typedefRegex_;
    std::regex macroRegex_;
    std::regex docCommentRegex_;
    std::regex templateRegex_;
};

} // namespace extractor
} // namespace opendocs