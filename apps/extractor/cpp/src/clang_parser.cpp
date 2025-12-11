#include "clang_parser.hpp"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <filesystem>

namespace fs = std::filesystem;

namespace opendocs {
namespace extractor {

ClangParser::ClangParser(const ClangParserConfig& config) : config_(config) {
    // Create index with excludeDeclarationsFromPCH = 1 and displayDiagnostics = 0
    index_ = clang_createIndex(1, 0);
}

ClangParser::~ClangParser() {
    if (translationUnit_) {
        clang_disposeTranslationUnit(translationUnit_);
    }
    if (index_) {
        clang_disposeIndex(index_);
    }
}

std::shared_ptr<model::DocSet> ClangParser::parseFile(const std::string& filePath) {
    std::vector<std::string> files = {filePath};
    return parseFiles(files);
}

std::shared_ptr<model::DocSet> ClangParser::parseFiles(const std::vector<std::string>& filePaths) {
    auto docSet = std::make_shared<model::DocSet>();
    docSet->id = "cpp-project";
    docSet->name = "C++ Project";
    docSet->version = "1.0.0";
    docSet->format = "json";

    if (config_.verbose) {
        std::cout << "ClangParser: Created DocSet\n";
    }

    auto project = std::make_shared<model::Project>();
    project->id = "cpp-lib";
    project->name = "C++ Library";
    project->language = model::SupportedLanguages::CPP;
    project->version = "1.0.0";

    // Build command line arguments
    std::vector<std::string> args;

    // Add include paths
    for (const auto& include : config_.includePaths) {
        args.push_back("-I" + include);
    }

    // Add defines
    for (const auto& define : config_.defines) {
        args.push_back("-D" + define);
    }

    // Add compiler flags
    args.insert(args.end(), config_.compilerFlags.begin(), config_.compilerFlags.end());

    // Always add C++17 standard
    args.push_back("-std=c++17");

    // Convert to C-style arguments
    std::vector<const char*> cArgs;
    cArgs.reserve(args.size());
    for (const auto& arg : args) {
        cArgs.push_back(arg.c_str());
    }

    // Parse each file
    for (const auto& filePath : filePaths) {
        if (config_.verbose) {
            std::cout << "Parsing: " << filePath << std::endl;
        }

        // Create translation unit
        if (config_.verbose) {
            std::cout << "ClangParser: Creating translation unit for " << filePath << std::endl;
        }

        translationUnit_ = clang_parseTranslationUnit(
            index_,
            filePath.c_str(),
            cArgs.data(),
            cArgs.size(),
            nullptr,
            0,
            CXTranslationUnit_DetailedPreprocessingRecord | CXTranslationUnit_IncludeBriefCommentsInCodeCompletion
        );

        if (!translationUnit_) {
            std::cerr << "Failed to parse: " << filePath << std::endl;
            continue;
        }

        if (config_.verbose) {
            std::cout << "ClangParser: Translation unit created successfully\n";
        }

        // Get the root cursor
        if (config_.verbose) {
            std::cout << "ClangParser: Getting translation unit cursor\n";
        }

        CXCursor rootCursor = clang_getTranslationUnitCursor(translationUnit_);

        if (config_.verbose) {
            std::cout << "ClangParser: Creating file item\n";
        }

        // Create file item
        auto fileItem = std::make_shared<model::DocItem>();
        fileItem->id = "file:" + filePath;
        fileItem->name = fs::path(filePath).filename().string();
        fileItem->kind = model::ItemKind::FILE;
        fileItem->location = model::Location{filePath, 1, 1};

        if (config_.verbose) {
            std::cout << "ClangParser: Parsing file-level comment\n";
        }

        // Parse file-level comment
        std::string fileComment = getComment(rootCursor);
        if (!fileComment.empty()) {
            fileItem->docBlock = parseComment(fileComment);
        }

        if (config_.verbose) {
            std::cout << "ClangParser: File item created\n";
        }

        project->items.push_back(fileItem);

        // Traverse the AST
        if (config_.verbose) {
            std::cout << "ClangParser: Starting AST traversal\n";
        }

        struct VisitorData {
            ClangParser* parser;
            std::vector<std::shared_ptr<model::DocItem>> items;
            std::string filePath;
        } visitorData{this, {}, filePath};

        clang_visitChildren(rootCursor, visitorStatic, &visitorData);

        if (config_.verbose) {
            std::cout << "ClangParser: AST traversal complete, found " << visitorData.items.size() << " items\n";
        }

        // Add all found items to the project
        for (auto& item : visitorData.items) {
            item->location->file = filePath;
            project->items.push_back(item);
        }

        // Clean up
        clang_disposeTranslationUnit(translationUnit_);
        translationUnit_ = nullptr;
    }

    docSet->projects.push_back(project);
    return docSet;
}

CXChildVisitResult ClangParser::visitorStatic(CXCursor cursor, CXCursor parent, CXClientData clientData) {
    auto* data = static_cast<VisitorData*>(clientData);
    return data->parser->visitor(cursor, parent, data->items, data->filePath);
}

CXChildVisitResult ClangParser::visitor(CXCursor cursor, CXCursor parent, std::vector<std::shared_ptr<model::DocItem>>& items, const std::string& filePath) {
    // Check if cursor is valid
    if (clang_Cursor_isNull(cursor)) {
        return CXChildVisit_Recurse;
    }

    CXCursorKind kind = clang_getCursorKind(cursor);

    // Skip if this is not a declaration
    if (!clang_isDeclaration(kind)) {
        return CXChildVisit_Recurse;
    }

    // Skip if this is in a system header
    if (clang_Location_isInSystemHeader(clang_getCursorLocation(cursor))) {
        return CXChildVisit_Recurse;
    }

    // Skip macros (they spam the output)
    if (kind == CXCursor_MacroDefinition) {
        return CXChildVisit_Recurse;
    }

    // Parse the cursor
    auto item = parseCursor(cursor, filePath);
    if (item) {
        items.push_back(item);
        if (config_.verbose) {
            std::cout << "Visitor: Added item: " << item->name << "\n";
        }
    }

    return CXChildVisit_Recurse;
}

std::shared_ptr<model::DocItem> ClangParser::parseCursor(CXCursor cursor, const std::string& filePath) {
    CXCursorKind kind = clang_getCursorKind(cursor);
    std::string spelling = getCursorSpelling(cursor);

    if (config_.verbose) {
        std::cout << "parseCursor: Processing " << spelling << " (kind: " << getCursorKindName(kind) << ")\n";
    }

    // Skip anonymous/empty names
    if (spelling.empty() || spelling.find("(<anonymous>") != std::string::npos) {
        return nullptr;
    }

    auto item = std::make_shared<model::DocItem>();
    item->id = getCursorUSR(cursor);
    if (item->id.empty()) {
        item->id = spelling; // Fallback to spelling if USR is not available
    }
    item->name = spelling;
    item->kind = convertCursorKind(kind);
    item->location = getCursorLocation(cursor);

    // Get comment
    std::string comment = getComment(cursor);
    if (!comment.empty()) {
        item->docBlock = parseComment(comment);
    }

    // Handle different cursor kinds
    switch (kind) {
        case CXCursor_FunctionDecl:
        case CXCursor_CXXMethod:
        case CXCursor_Constructor:
        case CXCursor_Destructor:
            {
                // Get return type
                CXType returnType = clang_getCursorResultType(cursor);
                if (returnType.kind != CXType_Invalid) {
                    item->returnType = model::TypeReference{
                        convertString(clang_getTypeSpelling(returnType)),
                        convertString(clang_getTypeSpelling(returnType)),
                        std::nullopt
                    };
                }

                // Get parameters
                item->parameters = getFunctionParameters(cursor);
            }
            break;

        case CXCursor_VarDecl:
        case CXCursor_FieldDecl:
            {
                // Get type
                CXType varType = clang_getCursorType(cursor);
                item->type = model::TypeReference{
                    convertString(clang_getTypeSpelling(varType)),
                    convertString(clang_getTypeSpelling(varType)),
                    std::nullopt
                };
            }
            break;

        case CXCursor_ClassDecl:
        case CXCursor_StructDecl:
            {
                        // Handle class/struct members
                VisitorData data{this, {}, filePath};
                clang_visitChildren(cursor, visitorStatic, &data);
                item->items = data.items;
            }
            break;

        case CXCursor_EnumDecl:
            {
                // Handle enum constants
                VisitorData data{this, {}, filePath};
                clang_visitChildren(cursor, visitorStatic, &data);
                item->items = data.items;
            }
            break;
    }

    return item;
}

std::string ClangParser::getCursorKindName(CXCursorKind kind) {
    return convertString(clang_getCursorKindSpelling(kind));
}

model::ItemKind ClangParser::convertCursorKind(CXCursorKind kind) {
    switch (kind) {
        case CXCursor_FunctionDecl: return model::ItemKind::FUNCTION;
        case CXCursor_CXXMethod: return model::ItemKind::METHOD;
        case CXCursor_Constructor: return model::ItemKind::CONSTRUCTOR;
        case CXCursor_Destructor: return model::ItemKind::DESTRUCTOR;
        case CXCursor_ClassDecl: return model::ItemKind::CLASS;
        case CXCursor_StructDecl: return model::ItemKind::STRUCT;
        case CXCursor_EnumDecl: return model::ItemKind::ENUM;
        case CXCursor_EnumConstantDecl: return model::ItemKind::ENUM_MEMBER;
        case CXCursor_Namespace: return model::ItemKind::NAMESPACE;
        case CXCursor_TypedefDecl: return model::ItemKind::TYPEDEF;
        case CXCursor_FieldDecl: return model::ItemKind::FIELD;
        case CXCursor_VarDecl: return model::ItemKind::VARIABLE;
        case CXCursor_MacroDefinition: return model::ItemKind::MACRO;
        default: return model::ItemKind::UNKNOWN;
    }
}

std::string ClangParser::getCursorSpelling(CXCursor cursor) {
    CXString spelling = clang_getCursorSpelling(cursor);
    std::string result = convertString(spelling);
    clang_disposeString(spelling);
    return result;
}

std::string ClangParser::getCursorDisplayName(CXCursor cursor) {
    CXString displayName = clang_getCursorDisplayName(cursor);
    std::string result = convertString(displayName);
    clang_disposeString(displayName);
    return result;
}

std::string ClangParser::getCursorUSR(CXCursor cursor) {
    CXString usr = clang_getCursorUSR(cursor);
    std::string result = convertString(usr);
    clang_disposeString(usr);
    return result;
}

model::Location ClangParser::getCursorLocation(CXCursor cursor) {
    model::Location location;

    CXSourceLocation sourceLoc = clang_getCursorLocation(cursor);
    CXFile file;
    unsigned line, column, offset;
    clang_getExpansionLocation(sourceLoc, &file, &line, &column, &offset);

    if (file) {
        CXString fileName = clang_getFileName(file);
        location.file = convertString(fileName);
        clang_disposeString(fileName);
    }

    location.line = line;
    location.column = column;

    return location;
}

std::string ClangParser::getComment(CXCursor cursor) {
    CXString comment = clang_Cursor_getRawCommentText(cursor);
    std::string result = convertString(comment);
    clang_disposeString(comment);
    return result;
}

std::vector<model::Parameter> ClangParser::getFunctionParameters(CXCursor cursor) {
    std::vector<model::Parameter> parameters;

    // Visit children to find parameters
    clang_visitChildren(cursor, &ClangParser::visitParameters, &parameters);

    return parameters;
}

CXChildVisitResult ClangParser::visitParameters(CXCursor cursor, CXCursor parent, CXClientData clientData) {
    auto* params = static_cast<std::vector<model::Parameter>*>(clientData);

    if (clang_getCursorKind(cursor) == CXCursor_ParmDecl) {
        model::Parameter param;
        CXString spelling = clang_getCursorSpelling(cursor);
        param.name = std::string(clang_getCString(spelling));
        clang_disposeString(spelling);

        CXType paramType = clang_getCursorType(cursor);
        CXString typeSpelling = clang_getTypeSpelling(paramType);
        param.type = std::string(clang_getCString(typeSpelling));
        clang_disposeString(typeSpelling);

        // Check for default value
        if (clang_Cursor_isNull(clang_getCursorDefinition(cursor)) == 0) {
            // Has default value - would need to extract it
        }

        params->push_back(param);
    }

    return CXChildVisit_Continue;
}

model::DocBlock ClangParser::parseComment(const std::string& comment) {
    model::DocBlock docBlock;

    if (comment.empty()) {
        return docBlock;
    }

    // Simple comment parsing - extract brief and detailed description
    std::string cleanComment = comment;

    // Remove comment markers
    size_t start = cleanComment.find("/**");
    if (start != std::string::npos) {
        cleanComment = cleanComment.substr(start + 3);
    }

    size_t end = cleanComment.rfind("*/");
    if (end != std::string::npos) {
        cleanComment = cleanComment.substr(0, end);
    }

    // Remove leading * and whitespace
    std::istringstream iss(cleanComment);
    std::string line;
    std::string description;

    while (std::getline(iss, line)) {
        // Remove leading whitespace and *
        size_t firstNonSpace = line.find_first_not_of(" \t*");
        if (firstNonSpace != std::string::npos) {
            line = line.substr(firstNonSpace);

            // Skip empty lines
            if (!line.empty()) {
                if (!description.empty()) {
                    description += " ";
                }
                description += line;
            }
        }
    }

    docBlock.description = description;

    // Extract brief description (first sentence)
    size_t period = description.find('.');
    if (period != std::string::npos) {
        docBlock.summary = description.substr(0, period + 1);
    } else {
        docBlock.summary = description;
    }

    return docBlock;
}

std::string ClangParser::convertString(CXString cxString) {
    std::string result;
    if (cxString.data) {
        result = clang_getCString(cxString);
    }
    clang_disposeString(cxString);
    return result;
}

} // namespace extractor
} // namespace opendocs