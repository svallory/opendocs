cmake_minimum_required(VERSION 3.16)
project(opendocs_sandbox_c VERSION 0.1.0 LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Library
add_library(calculator
    src/calculator.c
)

target_include_directories(calculator
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Link math library
target_link_libraries(calculator
    PRIVATE
        m
)

# Executable
add_executable(calc_example
    src/main.c
)

target_link_libraries(calc_example
    PRIVATE
        calculator
)

# Tests
if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/tests" AND IS_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/tests")
    enable_testing()
    add_subdirectory(tests)
endif()