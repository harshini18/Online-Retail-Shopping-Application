# Creating Inventory Service
Write-Host "Creating Inventory Service..." -ForegroundColor Green

# Create directories
New-Item -ItemType Directory -Force -Path "inventory-service\src\main\java\com\retail\inventory\entity"
New-Item -ItemType Directory -Force -Path "inventory-service\src\main\java\com\retail\inventory\repository"
New-Item -ItemType Directory -Force -Path "inventory-service\src\main\java\com\retail\inventory\service"
New-Item -ItemType Directory -Force -Path "inventory-service\src\main\java\com\retail\inventory\controller"
New-Item -ItemType Directory -Force -Path "inventory-service\src\main\resources"

# Build
Set-Location inventory-service
mvn clean package -DskipTests
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Inventory Service built successfully" -ForegroundColor Green
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -NoNewWindow
}
else {
    Write-Host "❌ Inventory Service build failed" -ForegroundColor Red
}
Set-Location ..

Write-Host "`nAll services creation complete!" -ForegroundColor Cyan
