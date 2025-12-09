#include "opendocs/model/types.hpp"
#include <sstream>

namespace opendocs {
namespace model {

std::string languageToString(SupportedLanguages lang) {
    switch (lang) {
        case SupportedLanguages::TYPESCRIPT: return "typescript";
        case SupportedLanguages::PYTHON: return "python";
        case SupportedLanguages::GO: return "go";
        case SupportedLanguages::RUST: return "rust";
        case SupportedLanguages::CPP: return "cpp";
        case SupportedLanguages::C: return "c";
        default: return "unknown";
    }
}

std::string itemKindToString(ItemKind kind) {
    switch (kind) {
        case ItemKind::FILE: return "file";
        case ItemKind::NAMESPACE: return "namespace";
        case ItemKind::MODULE: return "module";
        case ItemKind::CLASS: return "class";
        case ItemKind::INTERFACE: return "interface";
        case ItemKind::STRUCT: return "struct";
        case ItemKind::ENUM: return "enum";
        case ItemKind::TYPE_ALIAS: return "typeAlias";
        case ItemKind::FUNCTION: return "function";
        case ItemKind::METHOD: return "method";
        case ItemKind::CONSTRUCTOR: return "constructor";
        case ItemKind::DESTRUCTOR: return "destructor";
        case ItemKind::FIELD: return "field";
        case ItemKind::PROPERTY: return "property";
        case ItemKind::VARIABLE: return "variable";
        case ItemKind::CONSTANT: return "constant";
        case ItemKind::PARAMETER: return "parameter";
        case ItemKind::TYPE_PARAMETER: return "typeParameter";
        case ItemKind::ENUM_MEMBER: return "enumMember";
        case ItemKind::TYPEDEF: return "typedef";
        case ItemKind::MACRO: return "macro";
        default: return "unknown";
    }
}

} // namespace model
} // namespace opendocs