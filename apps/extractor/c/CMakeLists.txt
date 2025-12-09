cmake_minimum_required(VERSION 3.15)
project(opendocs-extract-c VERSION 0.1.0 LANGUAGES C)

# Set C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Find libclang (optional - for future implementation)
# find_package(Clang)

# Extractor executable
add_executable(opendocs-extract-c
    src/main.c
    src/extractor.c
)

# Include directories
target_include_directories(opendocs-extract-c
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Link libraries
# TODO: Link with libclang when parser is implemented
# if(Clang_FOUND)
#     target_link_libraries(opendocs-extract-c PRIVATE clang)
# endif()

# Compiler warnings
if(MSVC)
    target_compile_options(opendocs-extract-c PRIVATE /W4)
else()
    target_compile_options(opendocs-extract-c PRIVATE -Wall -Wextra -pedantic)
endif()

# Output directory
set_target_properties(opendocs-extract-c PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# Installation
install(TARGETS opendocs-extract-c
    RUNTIME DESTINATION bin
)
