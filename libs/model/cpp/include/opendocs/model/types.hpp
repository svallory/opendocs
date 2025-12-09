#pragma once

#include <string>
#include <vector>
#include <memory>
#include <optional>
#include <unordered_map>

namespace opendocs {
namespace model {

enum class SupportedLanguages {
    TYPESCRIPT,
    PYTHON,
    GO,
    RUST,
    CPP,
    C
};

enum class ItemKind {
    FILE,
    NAMESPACE,
    MODULE,
    CLASS,
    INTERFACE,
    STRUCT,
    ENUM,
    TYPE_ALIAS,
    FUNCTION,
    METHOD,
    CONSTRUCTOR,
    DESTRUCTOR,
    FIELD,
    PROPERTY,
    VARIABLE,
    CONSTANT,
    PARAMETER,
    TYPE_PARAMETER,
    ENUM_MEMBER,
    TYPEDEF,
    MACRO,
    UNKNOWN
};

enum class RelationKind {
    CONTAINS,
    EXTENDS,
    IMPLEMENTS,
    IMPORTS,
    EXPORTS,
    CALLS,
    REFERENCES,
    TYPE_REFERENCES,
    OVERRIDES,
    UNKNOWN
};

struct DocSetMetadata {
    std::optional<std::string> created;
    std::optional<std::string> modified;

    struct Generator {
        std::string name;
        std::string version;
    };

    std::optional<Generator> generator;
};

struct Repository {
    std::string type;
    std::string url;
    std::optional<std::string> directory;
    std::optional<std::string> branch;
    std::optional<std::string> tag;
};

struct Location {
    std::string file;
    int line;
    int column;
};

struct TypeReference {
    std::string name;
    std::string qualifiedName;
    std::optional<std::string> package;
};

struct Parameter {
    std::string name;
    std::string type;
    std::optional<std::string> defaultValue;
    std::optional<std::string> description;
    bool optional = false;
    bool rest = false;
};

struct DocTag {
    std::string name;
    std::string value;
    std::optional<std::string> type;
};

struct DocBlock {
    std::optional<std::string> summary;
    std::optional<std::string> description;
    std::optional<std::string> deprecated;
    std::vector<DocTag> tags;
};

struct Relation {
    std::string from;
    std::string to;
    RelationKind kind;
    std::optional<std::string> label;
};

struct DocItem {
    std::string id;
    std::string name;
    ItemKind kind;
    std::optional<DocBlock> docBlock;
    std::optional<Location> location;
    std::optional<TypeReference> type;
    std::optional<TypeReference> returnType;
    std::vector<Parameter> parameters;
    std::vector<std::string> typeParameters;
    std::vector<std::shared_ptr<DocItem>> items;
    std::vector<Relation> relations;
    std::optional<std::string> signature;
    std::optional<std::string> accessibility;
    bool optional = false;
    bool static_ = false;
    bool readonly = false;
    bool abstract = false;
    bool async = false;
    bool generator = false;
    std::optional<std::string> scope;

    int getItemCount() const {
        int count = 1;
        for (const auto& item : items) {
            count += item->getItemCount();
        }
        return count;
    }
};

struct Project {
    std::string id;
    std::string name;
    std::optional<std::string> description;
    SupportedLanguages language;
    std::optional<std::string> languageVersion;
    std::string version;
    std::optional<Repository> repository;
    std::vector<std::shared_ptr<DocItem>> items;
    std::unordered_map<std::string, std::string> metadata;

    int getItemCount() const {
        int count = 0;
        for (const auto& item : items) {
            count += item->getItemCount();
        }
        return count;
    }
};

struct DocSet {
    std::string id;
    std::string name;
    std::optional<std::string> description;
    std::string version;
    std::optional<std::string> format;
    std::vector<std::shared_ptr<Project>> projects;
    std::optional<DocSetMetadata> metadata;
    std::unordered_map<std::string, std::string> metadata2;
};

// Helper functions
std::string languageToString(SupportedLanguages lang);
std::string itemKindToString(ItemKind kind);

} // namespace model
} // namespace opendocs