#!/bin/zsh
set -e

export ANDROID_NDK_HOME="/opt/homebrew/share/android-ndk"
export SYSROOT="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/sysroot"

export GOOS=android
export GOARCH=arm64
export CGO_ENABLED=1

export CC="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android21-clang"
export CXX="$ANDROID_NDK_HOME/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android21-clang++"

export CGO_CFLAGS="--sysroot=$SYSROOT -I$SYSROOT/usr/include -I$SYSROOT/usr/include/aarch64-linux-android"
export CGO_CXXFLAGS="--sysroot=$SYSROOT -I$SYSROOT/usr/include -I$SYSROOT/usr/include/aarch64-linux-android"
export CGO_LDFLAGS="--sysroot=$SYSROOT"

go build -ldflags="-s -w" -o build/media_stream ./cmd

adb push build/media_stream /data/local/tmp/media_stream
adb shell chmod +x /data/local/tmp/media_stream

# http://192.168.1.192:8080/api/dev/podcast