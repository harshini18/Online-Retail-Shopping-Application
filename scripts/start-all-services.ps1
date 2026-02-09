# Start All Microservices Script
# This script starts each service in a separate PowerShell window

Write-Host "Starting all microservices..." -ForegroundColor Green

# Start Eureka Server
Write-Host "`n[1/10] Starting Eureka Server on port 8761..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'eureka-server'; Write-Host 'Eureka Server Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

# Wait for Eureka to start
Write-Host "Waiting 20 seconds for Eureka to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Start API Gateway
Write-Host "`n[2/10] Starting API Gateway on port 8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'api-gateway'; Write-Host 'API Gateway Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

# Wait a bit
Start-Sleep -Seconds 10

# Start all microservices
Write-Host "`n[3/10] Starting User Service on port 8081..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'user-service'; Write-Host 'User Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[4/10] Starting Product Service on port 8082..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'product-service'; Write-Host 'Product Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[5/10] Starting Inventory Service on port 8083..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'inventory-service'; Write-Host 'Inventory Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[6/10] Starting Cart Service on port 8084..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'cart-service'; Write-Host 'Cart Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[7/10] Starting Payment Service on port 8085..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'payment-service'; Write-Host 'Payment Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[8/10] Starting Order Service on port 8086..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'order-service'; Write-Host 'Order Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

Write-Host "`n[9/10] Starting Notification Service on port 8087..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'notification-service'; Write-Host 'Notification Service Starting...' -ForegroundColor Yellow; mvn spring-boot:run"

# Wait for microservices to start
Write-Host "`nWaiting 25 seconds for all microservices to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

# Start Frontend
Write-Host "`n[10/10] Starting Frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'retail-frontend'; Write-Host 'Frontend Starting...' -ForegroundColor Yellow; npm run dev"

Write-Host "`n" -NoNewline
Write-Host "============================================" -ForegroundColor Green
Write-Host "    All services are starting!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Please wait 1-2 minutes for all services to fully initialize." -ForegroundColor Yellow
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  - Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host "  - API Gateway:      http://localhost:8080" -ForegroundColor White
Write-Host "  - Frontend:         http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
