# Building/Running the backend

## Dev

- `docker build -f Dockerfile.dev -t openpin-server-dev .`
- `chmod +x ./dev.sh`
- `./dev.sh`

## Prod

- `docker build -t openpin-server .`
- `docker run -it -p 8080:8080 openpin-server`

`docker compose up -d --build --remove-orphans --force-recreate`

`npx prisma migrate dev --name init`

`./prod.sh --build`

docker exec -it openpin-dev bash

# inside container

npx prisma migrate dev --name my-schema-change
