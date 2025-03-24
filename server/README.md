# Building/Running the backend

## Dev

- `docker build -f Dockerfile.dev -t openpin-server-dev .`
- `chmod +x ./dev.sh`
- `./dev.sh`

## Prod

- `docker build -t openpin-server .`
- `docker run -it -p 8080:8080 openpin-server`
