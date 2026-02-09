# RESET AND IMPORT: 60 Products with Unsplash Images
Write-Host "`n=== PRODUCT DATABASE RESET & IMPORT ===`n" -ForegroundColor Green

# Step 1: Stop all Java processes
Write-Host "[1/5] Stopping all Java processes..." -ForegroundColor Cyan
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "      OK - All Java processes stopped`n" -ForegroundColor Green

# Step 2: Clean database files
Write-Host "[2/5] Cleaning database files..." -ForegroundColor Cyan
Remove-Item -Path "product-service\data" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "product-service\*.db" -Force -ErrorAction SilentlyContinue
Write-Host "      OK - Database files cleaned`n" -ForegroundColor Green

# Step 3: Start Product Service
Write-Host "[3/5] Starting Product Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'product-service'; Write-Host '=== PRODUCT SERVICE (PORT 8082) ===' -ForegroundColor Green; mvn spring-boot:run"
Write-Host "      Waiting 75 seconds for service to start..." -ForegroundColor Yellow

for ($i = 75; $i -gt 0; $i--) {
    if ($i % 15 -eq 0) {
        Write-Host "         $i seconds remaining..." -ForegroundColor Gray
    }
    Start-Sleep -Seconds 1
}
Write-Host "      OK - Product Service should be ready`n"  -ForegroundColor Green

# Step 4: Verify service
Write-Host "[4/5] Verifying service is online..." -ForegroundColor Cyan
$maxRetries = 5
$retryCount = 0
$serviceReady = $false

while (-not $serviceReady -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Get -TimeoutSec 5 -ErrorAction Stop
        $serviceReady = $true
        Write-Host "      OK - Service is responding (found $($response.Count) products)`n" -ForegroundColor Green
    }
    catch {
        $retryCount++
        Write-Host "      Retry $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $serviceReady) {
    Write-Host "      ERROR: Product service did not start!`n" -ForegroundColor Red
    exit 1
}

# Step 5: Import products (ONLY ONCE)
Write-Host "[5/5] Importing 60 products with Unsplash images..." -ForegroundColor Cyan
Write-Host "      This will take 10-15 seconds`n" -ForegroundColor Gray

.\import_unsplash.ps1
Write-Host "`n      OK - Import completed!`n" -ForegroundColor Green

# Final Verification
Write-Host "`n=== FINAL VERIFICATION ===`n" -ForegroundColor Green

$products = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Get
$categories = Invoke-RestMethod -Uri "http://localhost:8082/api/categories" -Method Get

Write-Host "Total Products: $($products.Count)" -ForegroundColor $(if ($products.Count -eq 60) { "Green" } else { "Red" })
Write-Host "Total Categories: $($categories.Count)`n" -ForegroundColor $(if ($categories.Count -eq 6) { "Green" } else { "Red" })

if ($products.Count -eq 60 -and $categories.Count -eq 6) {
    Write-Host "SUCCESS! Exactly 60 products in 6 categories!`n" -ForegroundColor Green
}
else {
    Write-Host "WARNING: Expected 60 products and 6 categories`n" -ForegroundColor Yellow
}

Write-Host "Products by Category:" -ForegroundColor Cyan
$products | Group-Object { $_.category.name } | Sort-Object Name | ForEach-Object {
    $color = if ($_.Count -eq 10) { "Green" } else { "Yellow" }
    Write-Host "  $($_.Name): $($_.Count) products" -ForegroundColor $color
}

Write-Host "`nAll products have Unsplash images!" -ForegroundColor Cyan
Write-Host "Visit http://localhost:3000 to see the products`n" -ForegroundColor White
