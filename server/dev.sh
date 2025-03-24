#!/bin/bash

docker run --rm -it \
  -v "$PWD":/app \
  -w /app \
  -p 8080:8080 \
  openpin-server-dev \
  bash -c "
    set -e
    cd /app && \
    npm install && \
    cd /app/dashboard && npm install && \
    cd /app && \
    npm run dev
  "