@echo off
echo Starting PotatoScan...
docker-compose up -d
timeout /t 3 /nobreak
start http://localhost:3000