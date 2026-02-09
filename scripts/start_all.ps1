# START ALL SERVICES - Complete System Startup

Write-Host "`n=== STARTING ALL SERVICES ===`n" -ForegroundColor Green

# Services to start
$services = @(
    @{Name = "Eureka Server"; Dir = "eureka-server"; Port = 8761 },
    @{Name = "API Gateway"; Dir = "api-gateway"; Port = 8080 },
    @{Name = "User Service"; Dir = "user-service"; Port = 8081 },
    @{Name = "Product Service"; Dir = "product-service"; Port = 8082 },
    @{Name = "Inventory Service"; Dir = "inventory-service"; Port = 8083 },
    @{Name = "Cart Service"; Dir = "cart-service"; Port = 8084 },
    @{Name = "Order Service"; Dir = "order-service"; Port = 8085 },
    @{Name = "Payment Service"; Dir = "payment-service"; Port = 8086 },
    @{Name = "Notification Service"; Dir = "notification-service"; Port = 8087 }
)

# Start each service
foreach ($svc in $services) {
    Write-Host "Starting $($svc.Name) on port $($svc.Port)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($svc.Dir)'; Write-Host '=== $($svc.Name.ToUpper()) (PORT $($svc.Port)) ===' -ForegroundColor Green; mvn spring-boot:run"
    Start-Sleep -Seconds 2
}

Write-Host "`nWaiting 90 seconds for all services to start...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 90

# Start Frontend
Write-Host "Starting React Frontend on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'retail-frontend'; Write-Host '=== REACT FRONTEND (PORT 3000) ===' -ForegroundColor Green; npm run dev"

Write-Host "`nWaiting 15 seconds for frontend to start...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n=== ALL SERVICES STARTED ===`n" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "Eureka Dashboard: http://localhost:8761`n" -ForegroundColor White
