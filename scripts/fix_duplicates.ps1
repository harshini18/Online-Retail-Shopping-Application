# FIX DUPLICATES SCRIPT
# Ensures exactly 60 products

Write-Host "=== FIXING DUPLICATES ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8082/api"

# Function to check count
function Get-Count {
    try {
        $p = Invoke-RestMethod -Uri "$baseUrl/products" -ErrorAction SilentlyContinue
        return $p.Count
    }
    catch { return -1 }
}

# Step 1: Try to delete via API
Write-Host "`n[1/3] Attempting to clear database via API..."
try {
    Invoke-RestMethod -Uri "$baseUrl/products/deleteAll" -Method Delete -ErrorAction Stop
    Invoke-RestMethod -Uri "$baseUrl/categories/deleteAll" -Method Delete -ErrorAction Stop
    Write-Host "✓ Cleared via API" -ForegroundColor Green
}
catch {
    Write-Host "⚠ Delete endpoints not working. Restarting Product Service..." -ForegroundColor Yellow
    
    # Kill process on port 8082
    $id = (Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue).OwningProcess
    if ($id) { Stop-Process -Id $id -Force }
    
    # Start fresh
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'product-service'; mvn spring-boot:run"
    
    # Wait for startup
    Write-Host "Waiting 60s for service restart..."
    Start-Sleep -Seconds 60
}

# Verify empty
$count = Get-Count
Write-Host "Current count: $count (Should be 0)" -ForegroundColor $(if ($count -eq 0) { "Green" }else { "Red" })

# Step 2: Import ONCE
if ($count -eq 0) {
    Write-Host "`n[2/3] Importing 60 products..."
    .\import_unsplash.ps1
}
else {
    Write-Host "ERROR: Could not clear database." -ForegroundColor Red
    exit
}

# Step 3: Verify
$final = Get-Count
Write-Host "`n[3/3] Final Verification"
Write-Host "Total Products: $final" -ForegroundColor $(if ($final -eq 60) { "Green" }else { "Red" })

if ($final -eq 60) {
    Write-Host "`nSUCCESS! Duplicates removed. Exactly 60 products." -ForegroundColor Green
}
else {
    Write-Host "`nWARNING: Still have unexpected count." -ForegroundColor Yellow
}
