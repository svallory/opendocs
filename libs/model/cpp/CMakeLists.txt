cmake_minimum_required(VERSION 3.16)
project(opendocs_model_cpp VERSION 0.1.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Create the library
add_library(opendocs_model STATIC
    src/types.cpp
)

# Set include directories
target_include_directories(opendocs_model
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Installation
install(TARGETS opendocs_model
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
)

install(DIRECTORY include/
    DESTINATION include
)