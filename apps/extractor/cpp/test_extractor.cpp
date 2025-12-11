#include "include/extractor.hpp"
#include "include/parser.hpp"
#include "include/doc_comment_parser.hpp"
#include <iostream>
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

int main() {
    std::cout << "Testing C++ extractor..." << std::endl;

    // Test 1: Test the parser
    {
        std::cout << "\n1. Testing parser..." << std::endl;
        opendocs::extractor::CppParser parser;

        // Create a test file
        std::string testFile = "test_input.cpp";
        std::ofstream file(testFile);
        file << "// This is a test file\n";
        file << "/// \\brief A simple calculator class\n";
        file << "/// This class provides basic arithmetic operations\n";
        file << "class Calculator {\n";
        file << "public:\n";
        file << "    /// Add two numbers\n";
        file << "    /// \\param a First number\n";
        file << "    /// \\param b Second number\n";
        file << "    /// \\return The sum\n";
        file << "    int add(int a, int b) { return a + b; }\n";
        file << "};\n";
        file.close();

        try {
            auto result = parser.parseFile(testFile);
            std::cout << "  Parsed " << result.items.size() << " items from test file" << std::endl;

            for (const auto& item : result.items) {
                std::cout << "  - " << item->name << " (" << opendocs::model::itemKindToString(item->kind) << ")" << std::endl;
            }
        } catch (const std::exception& e) {
            std::cout << "  Parser test failed: " << e.what() << std::endl;
        }

        fs::remove(testFile);
    }

    // Test 2: Test the doc comment parser
    {
        std::cout << "\n2. Testing doc comment parser..." << std::endl;
        opendocs::extractor::DocCommentParser parser;

        std::string comment = R"(/**
         * \\brief This is a brief description
         *
         * This is a longer description that explains
         * what this function does in detail.
         *
         * \\param x The input parameter
         * \\return The result of the operation
         * \\throws std::runtime_error if something goes wrong
         */)";

        auto result = parser.parse(comment);
        std::cout << "  Description: " << result.description.substr(0, 50) << "..." << std::endl;
        std::cout << "  Tags found: " << result.tags.size() << std::endl;

        for (const auto& tag : result.tags) {
            std::cout << "  - " << tag.name << ": " << tag.value << std::endl;
        }
    }

    // Test 3: Test the extractor
    {
        std::cout << "\n3. Testing extractor..." << std::endl;
        opendocs::extractor::ExtractorConfig config;
        config.projectName = "Test Project";
        config.projectId = "test-project";
        config.projectVersion = "1.0.0";

        opendocs::extractor::CppExtractor extractor(config);

        // Create a test source file
        std::string testSource = "test_calculator.cpp";
        std::ofstream srcFile(testSource);
        srcFile << "// Calculator implementation\n";
        srcFile << "/// \\class Calculator\n";
        srcFile << "/// A simple calculator for basic operations\n";
        srcFile << "class Calculator {\n";
        srcFile << "public:\n";
        srcFile << "    /// Constructor\n";
        srcFile << "    Calculator() = default;\n";
        srcFile << "    \n";
        srcFile << "    /// Add two integers\n";
        srcFile << "    int add(int a, int b) { return a + b; }\n";
        srcFile << "    \n";
        srcFile << "    /// Subtract two integers\n";
        srcFile << "    int subtract(int a, int b) { return a - b; }\n";
        srcFile << "};\n";
        srcFile.close();

        try {
            auto docSet = extractor.extract({testSource});
            std::cout << "  Extracted " << docSet->projects.size() << " projects" << std::endl;

            if (!docSet->projects.empty()) {
                const auto& project = docSet->projects[0];
                std::cout << "  Project: " << project->name << std::endl;
                std::cout << "  Items: " << project->items.size() << std::endl;

                for (const auto& item : project->items) {
                    std::cout << "    - " << item->name << " (" << opendocs::model::itemKindToString(item->kind) << ")" << std::endl;
                }
            }
        } catch (const std::exception& e) {
            std::cout << "  Extractor test failed: " << e.what() << std::endl;
        }

        fs::remove(testSource);
    }

    std::cout << "\nAll tests completed!" << std::endl;
    return 0;
}