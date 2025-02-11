# GeoData API with PostgreSQL, Redis, and GeoServer

This project provides a REST API to fetch geospatial data from PostgreSQL (PostGIS) and GeoServer, with caching in Redis for optimized performance. The backend is built using Express.js and runs in Docker containers.

## Features
- Fetch GeoJSON data from GeoServer
- Fetch geospatial data from PostgreSQL
- Caching with Redis for optimized performance
- Containerized with Docker and Docker Compose

## Technologies Used
- Node.js (Express.js)
- PostgreSQL (PostGIS)
- Redis
- GeoServer
- Docker & Docker Compose

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geodata-api.git
   cd geodata-api
   ```

2. Create a `.env` file in the root directory and configure environment variables:
   ```env
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=admin
   POSTGRES_DB=geodb
   POSTGRES_HOST=postgres
   POSTGRES_PORT=5432
   REDIS_HOST=redis
   REDIS_PORT=6379
   PORT=5001
   GEOSERVER_URL=http://geoserver:8080/geoserver
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

4. Verify that all services are running:
   ```bash
   docker ps
   ```

## API Endpoints

### Fetch GeoJSON from GeoServer
```
GET /api/geojson
```
- Retrieves GeoJSON data from GeoServer.
- Uses Redis caching for 5 minutes.

### Fetch Data from PostgreSQL
```
GET /api/pgdata
```
- Retrieves spatial data from PostgreSQL (PostGIS) as a GeoJSON format.

## Stopping and Removing Containers
```bash
docker-compose down
```

To remove volumes:
```bash
docker-compose down -v
```

To remove a specific volume:
```bash
docker volume rm volume_name
```

## Useful Docker Commands

List all running containers:
```bash
docker ps
```

List all volumes:
```bash
docker volume ls
```

## Troubleshooting

### Redis Connection Issues
If Redis fails to connect, restart the container:
```bash
docker restart redis
```

### PostgreSQL Connection Issues
If PostgreSQL refuses connections, check logs:
```bash
docker logs postgres
```

### Check Logs for API Server
```bash
docker logs geodata-api
```

## License
This project is licensed under the MIT License.
