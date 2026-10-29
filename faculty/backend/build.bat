@echo off
echo Compiling Academic Result Analysis System (with Relative Grading Engine)...
g++ -std=c++14 -O2 src/main.cpp src/storage.cpp src/academic.cpp src/relative_grading.cpp -Iinclude -lws2_32 -o server.exe
if %errorlevel% neq 0 (
    echo BUILD FAILED
    exit /b 1
)
echo BUILD SUCCESS - run server.exe to start
