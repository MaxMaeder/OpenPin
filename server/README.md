# Building/Running the backend

## Dev

- `docker build -f Dockerfile.dev -t openpin-server-dev .`
- `chmod +x ./dev.sh`
- `./dev.sh`
- Tailscale FW: `socat TCP-LISTEN:8080,fork TCP:maxbox:8080`

## Prod

- `docker build -t openpin-server .`
- `docker run -it -p 8080:8080 openpin-server`

`docker compose up -d --build --remove-orphans --force-recreate`