# Import products with Unsplash realistic images
$h = @{"Content-Type" = "application/json" }
$b = "http://localhost:8082/api"


Write-Host "`nImporting 60 products with realistic images...`n" -ForegroundColor Cyan

# Create categories
$cats = @("Electronics", "Clothing", "Footwear", "Accessories", "Beauty Products", "Home Living")
$catIds = @{}

foreach ($cat in $cats) {
    $result = Invoke-RestMethod -Uri "$b/categories" -Method Post -Headers $h -Body (ConvertTo-Json @{name = $cat; description = "Premium $cat" })
    $catIds[$cat] = $result.id
    Write-Host "Created: $cat" -ForegroundColor Green
}

# Import products
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

Write-Host "`n✅ COMPLETE! $total products imported with realistic Unsplash images!`n" -ForegroundColor Green
Write-Host "Test at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login: customer@test.com / customer123`n" -ForegroundColor Yellow
