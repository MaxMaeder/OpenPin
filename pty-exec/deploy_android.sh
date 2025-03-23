#!/bin/bash
set -e

ABI=arm64-v8a
NDK=$ANDROID_NDK_HOME
API=23

rm -rf build CMakeCache.txt CMakeFiles

cmake -B build -S . \
  -DANDROID_ABI=$ABI \
  -DANDROID_PLATFORM=android-$API \
  -DANDROID_NDK=$NDK \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_TOOLCHAIN_FILE=$NDK/build/cmake/android.toolchain.cmake

cmake --build build --config Release

adb push build/pty_exec /data/local/tmp/pty_exec
adb shell chmod +x /data/local/tmp/pty_exec