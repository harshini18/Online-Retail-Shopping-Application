# Test Order Status Update API (Self-Contained)

$urlBase = "http://localhost:8081/api/orders"

# 1. Create a Dummy Order
Write-Host "Creating Seed Order..." -ForegroundColor Cyan
$orderBody = @{
    userId          = 1
    totalAmount     = 500.00
    shippingAddress = "Test Address"
    paymentId       = 100
    status          = "PENDING"
} | ConvertTo-Json

try {
    $order = Invoke-RestMethod -Uri $urlBase -Method Post -Body $orderBody -ContentType "application/json"
    $orderId = $order.id
    Write-Host "Success! Created Order ID: $orderId" -ForegroundColor Green
}
catch {
    Write-Host "Failed to create seed order: $_" -ForegroundColor Red
    exit
}

# 2. Update Status to SHIPPED
Write-Host "`nUpdating Order $orderId status to SHIPPED..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$urlBase/$orderId/status?status=SHIPPED" -Method Put
    Write-Host "Success! API Response Status: $($response.status)" -ForegroundColor Green
}
catch {
    Write-Host "Failed to update status: $_" -ForegroundColor Red
    exit
}

# 3. Verify Update
Write-Host "`nVerifying Order Status..." -ForegroundColor Cyan
try {
    $checkOrder = Invoke-RestMethod -Uri "$urlBase/$orderId" -Method Get
    if ($checkOrder.status -eq "SHIPPED") {
        Write-Host "Verification Passed! Order status is $($checkOrder.status)" -ForegroundColor Green
    }
    else {
        Write-Host "Verification Failed. Expected SHIPPED, got $($checkOrder.status)" -ForegroundColor Red
    }
}
catch {
    Write-Host "Failed to get order: $_" -ForegroundColor Red
}
