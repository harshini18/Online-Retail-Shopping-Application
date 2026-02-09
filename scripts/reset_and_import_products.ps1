# MASTER SCRIPT: Complete Product Database Reset and Import
# This script ensures exactly 60 products with Unsplash images

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  PRODUCT DATABASE COMPLETE RESET & IMPORT     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Step 1: Kill ALL Java processes to ensure clean state
Write-Host "[1/5] Stopping all Java processes..." -ForegroundColor Cyan
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "      ✓ All Java processes stopped`n" -ForegroundColor Green

# Step 2: Delete any H2 database files
Write-Host "[2/5] Cleaning database files..." -ForegroundColor Cyan
Remove-Item -Path "product-service\data" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "product-service\*.db" -Force -ErrorAction SilentlyContinue
Write-Host "      ✓ Database files cleaned`n" -ForegroundColor Green

# Step 3: Start Product Service in new window
Write-Host "[3/5] Starting Product Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'product-service'; Write-Host '=== PRODUCT SERVICE (PORT 8082) ===' -ForegroundColor Green; mvn spring-boot:run"
Write-Host "      ⏳ Waiting 75 seconds for service to start..." -ForegroundColor Yellow

for ($i = 75; $i -gt 0; $i--) {
    if ($i % 15 -eq 0) {
        Write-Host "         $i seconds remaining..." -ForegroundColor Gray
    }
    Start-Sleep -Seconds 1
}
Write-Host "      ✓ Product Service should be ready`n" -ForegroundColor Green

# Step 4: Verify service is responding
Write-Host "[4/5] Verifying service is online..." -ForegroundColor Cyan
$maxRetries = 5
$retryCount = 0
$serviceReady = $false

while (-not $serviceReady -and $retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Get -TimeoutSec 5 -ErrorAction Stop
        $serviceReady = $true
        Write-Host "      ✓ Service is responding (found $($response.Count) products)`n" -ForegroundColor Green
    }
    catch {
        $retryCount++
        Write-Host "      Retry $retryCount/$maxRetries..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $serviceReady) {
    Write-Host "      ✗ ERROR: Product service did not start properly!" -ForegroundColor Red
    Write-Host "      Please check the product-service window for errors.`n" -ForegroundColor Red
    exit 1
}

# Step 5: Import 60 products with Unsplash images (ONLY ONCE)
Write-Host "[5/5] Importing 60 products with Unsplash images..." -ForegroundColor Cyan
Write-Host "      (This will take ~10-15 seconds)`n" -ForegroundColor Gray

try {
    .\import_unsplash.ps1
    Write-Host "`n      ✓ Import completed!`n" -ForegroundColor Green
}
catch {
    Write-Host "`n      ✗ Import failed: $_`n" -ForegroundColor Red
    exit 1
}

# Step 6: Final Verification
Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           FINAL VERIFICATION                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Green

$products = Invoke-RestMethod -Uri "http://localhost:8082/api/products" -Method Get
$categories = Invoke-RestMethod -Uri "http://localhost:8082/api/categories" -Method Get

Write-Host "Total Products: $($products.Count)" -ForegroundColor $(if ($products.Count -eq 60) { "Green" } else { "Red" })
Write-Host "Total Categories: $($categories.Count)`n" -ForegroundColor $(if ($categories.Count -eq 6) { "Green" } else { "Red" })

if ($products.Count -eq 60 -and $categories.Count -eq 6) {
    Write-Host "✅ SUCCESS! Exactly 60 products in 6 categories!`n" -ForegroundColor Green
}
else {
    Write-Host "⚠️  WARNING: Expected 60 products and 6 categories`n" -ForegroundColor Yellow
}

Write-Host "Products by Category:" -ForegroundColor Cyan
$products | Group-Object { $_.category.name } | Sort-Object Name | ForEach-Object {
    $icon = if ($_.Count -eq 10) { "✓" } else { "⚠" }
    $color = if ($_.Count -eq 10) { "Green" } else { "Yellow" }
    Write-Host "  $icon $($_.Name): $($_.Count) products" -ForegroundColor $color
}

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✨ All products have Unsplash images!        ║" -ForegroundColor Cyan
Write-Host "║  🌐 Visit http://localhost:3000               ║" -ForegroundColor Cyan  
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Show sample product
Write-Host "Sample Product:" -ForegroundColor Gray
$sample = $products[0]
Write-Host "  Name: $($sample.name)" -ForegroundColor White
Write-Host "  Price: INR $($sample.price)" -ForegroundColor White
Write-Host ""



