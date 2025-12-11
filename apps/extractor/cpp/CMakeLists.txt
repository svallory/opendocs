cmake_minimum_required(VERSION 3.16)
project(opendocs_extractor_cpp VERSION 0.1.0 LANGUAGES C CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Options
option(BUILD_TESTS "Build tests" OFF)

# Find dependencies
find_package(LLVM REQUIRED CONFIG)
find_package(Clang REQUIRED CONFIG)

# Include the model library
add_subdirectory(../../../libs/model/cpp opendocs_model)

# Create the executable
add_executable(opendocs-extract-cpp
    src/main.cpp
    src/extractor.cpp
    src/clang_parser.cpp
)

# Set include directories
target_include_directories(opendocs-extract-cpp
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/../../../libs/model/cpp/include
        ${LLVM_INCLUDE_DIRS}
        ${CLANG_INCLUDE_DIRS}
)

# Link dependencies
target_link_libraries(opendocs-extract-cpp
    PRIVATE
        opendocs_model
        clang-cpp
        LLVM
        /opt/homebrew/opt/llvm/lib/libclang.dylib
)

# Set properties
set_target_properties(opendocs-extract-cpp PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)

# Installation
install(TARGETS opendocs-extract-cpp
    RUNTIME DESTINATION bin
)

# Tests
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()