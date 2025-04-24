#!/bin/bash
set -e

export GOOS=linux
export GOARCH=arm64
export CGO_ENABLED=0

go build -ldflags="-s -w" -o build/ogg_stream ./cmd


adb push build/ogg_stream /data/local/tmp/ogg_stream
adb shell chmod +x /data/local/tmp/ogg_stream
