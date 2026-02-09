# Test Add to Cart with Name and Image

$userId = 1
$productId = 101
$url = "http://localhost:8084/api/cart"

$body = @{
    userId    = $userId
    productId = $productId
    quantity  = 1
    price     = 999.99
    name      = "Test Product"
    imageUrl  = "http://test.com/image.jpg"
} | ConvertTo-Json

Write-Host "Adding item to cart..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success! Added item ID: $($response.id)" -ForegroundColor Green
    Write-Host "Name: $($response.name)"
    Write-Host "Image: $($response.imageUrl)"
}
catch {
    Write-Host "Failed to add item. Error: $_" -ForegroundColor Red
}

Write-Host "`nVerifying Cart Content..." -ForegroundColor Cyan
try {
    $cart = Invoke-RestMethod -Uri "$url/$userId"
    Write-Host "Cart Items: $($cart.Count)"
    $cart | Format-Table id, name, price, quantity, imageUrl
}
catch {
    Write-Host "Failed to get cart." -ForegroundColor Red
}
