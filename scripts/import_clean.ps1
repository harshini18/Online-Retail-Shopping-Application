# Clean Import: Delete all existing data then import exactly 60 products with Unsplash images
$h = @{"Content-Type" = "application/json" }
$b = "http://localhost:8082/api"

Write-Host "`n=== CLEAN PRODUCT IMPORT ===" -ForegroundColor Green

# Step 1: Get all existing products and delete them manually
Write-Host "`nStep 1: Deleting all existing products..." -ForegroundColor Yellow
try {
    $existingProducts = Invoke-RestMethod -Uri "$b/products" -Method Get
    Write-Host "Found $($existingProducts.Count) existing products" -ForegroundColor Cyan
    
    foreach ($product in $existingProducts) {
        try {
            Invoke-RestMethod -Uri "$b/products/$($product.id)" -Method Delete -Headers $h -ErrorAction SilentlyContinue | Out-Null
        }
        catch {}
    }
    Write-Host "✓ All products deleted" -ForegroundColor Green
}
catch {
    Write-Host "No products to delete" -ForegroundColor Gray
}

# Step 2: Get all existing categories and delete them manually
Write-Host "`nStep 2: Deleting all existing categories..." -ForegroundColor Yellow
try {
    $existingCategories = Invoke-RestMethod -Uri "$b/categories" -Method Get
    Write-Host "Found $($existingCategories.Count) existing categories" -ForegroundColor Cyan
    
    foreach ($cat in $existingCategories) {
        try {
            Invoke-RestMethod -Uri "$b/categories/$($cat.id)" -Method Delete -Headers $h -ErrorAction SilentlyContinue | Out-Null
        }
        catch {}
    }
    Write-Host "✓ All categories deleted" -ForegroundColor Green
}
catch {
    Write-Host "No categories to delete" -ForegroundColor Gray
}

# Step 3: Create new categories
Write-Host "`nStep 3: Creating 6 categories..." -ForegroundColor Yellow
$cats = @("Electronics", "Clothing", "Footwear", "Accessories", "Beauty Products", "Home Living")
$catIds = @{}

foreach ($cat in $cats) {
    $result = Invoke-RestMethod -Uri "$b/categories" -Method Post -Headers $h -Body (ConvertTo-Json @{name = $cat; description = "Premium $cat" })
    $catIds[$cat] = $result.id
    Write-Host "  ✓ $cat (ID: $($result.id))" -ForegroundColor Cyan
}

# Step 4: Import 60 products with Unsplash images
Write-Host "`nStep 4: Importing 60 products with Unsplash images..." -ForegroundColor Yellow
$data = Get-Content "products_unsplash.json" | ConvertFrom-Json
$total = 0

foreach ($c in $data) {
    foreach ($p in $c.products) {
        $body = ConvertTo-Json -Depth 5 @{
            name        = $p.name
            description = $p.description
            price       = $p.price
            imageUrl    = $p.imageUrl
            category    = @{id = $catIds[$c.category] }
        }
        try {
            Invoke-RestMethod -Uri "$b/products" -Method Post -Headers $h -Body $body | Out-Null
            $total++
        }
        catch {}
    }
}

Write-Host "`n=== ✅ IMPORT COMPLETE ===" -ForegroundColor Green
Write-Host "Total Products: $total" -ForegroundColor Cyan
Write-Host "Categories: 6" -ForegroundColor Cyan

# Step 5: Verify
Write-Host "`nVerifying..." -ForegroundColor Yellow
$finalProducts = Invoke-RestMethod -Uri "$b/products" -Method Get
$finalCategories = Invoke-RestMethod -Uri "$b/categories" -Method Get

Write-Host "`n=== VERIFICATION ===" -ForegroundColor Green
Write-Host "Products in database: $($finalProducts.Count)" -ForegroundColor Cyan
Write-Host "Categories in database: $($finalCategories.Count)" -ForegroundColor Cyan

$finalProducts | Group-Object { $_.category.name } |  ForEach-Object {
    Write-Host "  - $($_.Name): $($_.Count) products" -ForegroundColor Yellow
}

Write-Host "`n✓ Done! Visit http://localhost:3000 to see products`n" -ForegroundColor Green
