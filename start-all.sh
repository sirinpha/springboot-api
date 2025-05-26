echo "Starting all services..."
docker network create app-network 2>/dev/null || true
docker-compose -f docker-compose-db.yml up -d
#sleep 3
docker-compose -f ./spring-api/docker-compose-spring-api.yml up -d
docker-compose -f ./ang-jwt/docker-compose-ang-jwt.yml up -d
echo "All services started!"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

#./start-all.sh