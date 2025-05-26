echo "Stopping all services..."
docker-compose -f ./ang-jwt/docker-compose-ang-jwt.yml down
docker-compose -f ./spring-api/docker-compose-spring-api.yml down
docker-compose -f docker-compose-db.yml down
echo "All services stopped!"
docker ps

#./stop-all.sh