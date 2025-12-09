cmake_minimum_required(VERSION 3.15)
project(opendocs-model-c VERSION 0.1.0 LANGUAGES C)

# Set C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Library target
add_library(opendocs-model-c
    src/types.c
)

# Include directories
target_include_directories(opendocs-model-c
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
)

# Compiler warnings
if(MSVC)
    target_compile_options(opendocs-model-c PRIVATE /W4)
else()
    target_compile_options(opendocs-model-c PRIVATE -Wall -Wextra -pedantic)
endif()

# Installation
install(TARGETS opendocs-model-c
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY include/opendocs
    DESTINATION include
)
