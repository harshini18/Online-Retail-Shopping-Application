# Test Checkout Flow (frontend simulation)

$userId = 1
$baseUrl = "http://localhost:8080" # API Gateway (if running) or direct services?
# Using direct services for now to verify logic, assuming gateway might be on 8080 but let's go direct to be sure of service logic first, 
# or actually, the user frontend connects to gateway. Let's try direct service ports to isolate the service logic.
# Cart: 8084, Payment: 8085, Order: 8081

$cartUrl = "http://localhost:8084/api/cart"
$paymentUrl = "http://localhost:8085/api/payments"
$orderUrl = "http://localhost:8081/api/orders"

# 1. Add Item to Cart
Write-Host "`n1. Adding Item to Cart..." -ForegroundColor Cyan
$cartBody = @{
    userId    = $userId
    productId = 101
    quantity  = 1
    price     = 1500.00
    name      = "Premium Watch"
    imageUrl  = "http://test.com/watch.jpg"
} | ConvertTo-Json

try {
    $cartRes = Invoke-RestMethod -Uri $cartUrl -Method Post -Body $cartBody -ContentType "application/json"
    Write-Host "Success! Item added." -ForegroundColor Green
}
catch {
    Write-Host "Failed to add to cart: $_" -ForegroundColor Red
    exit
}

# 2. Process Payment
Write-Host "`n2. Processing Payment..." -ForegroundColor Cyan
$paymentBody = @{
    userId        = $userId
    amount        = 1500.00
    paymentMethod = "UPI"
    status        = "SUCCESS"
} | ConvertTo-Json

try {
    $paymentRes = Invoke-RestMethod -Uri $paymentUrl -Method Post -Body $paymentBody -ContentType "application/json"
    $paymentId = $paymentRes.id
    Write-Host "Success! Payment Processed. Payment ID: $paymentId" -ForegroundColor Green
    Write-Host "Transaction ID: $($paymentRes.transactionId)"
}
catch {
    Write-Host "Payment Failed: $_" -ForegroundColor Red
    exit
}

# 3. Place Order
Write-Host "`n3. Placing Order..." -ForegroundColor Cyan
$orderBody = @{
    userId          = $userId
    totalAmount     = 1500.00
    shippingAddress = "123 Test St, Tech City"
    paymentId       = $paymentId
    status          = "PENDING"
} | ConvertTo-Json

try {
    $orderRes = Invoke-RestMethod -Uri $orderUrl -Method Post -Body $orderBody -ContentType "application/json"
    Write-Host "Success! Order Placed. Order ID: $($orderRes.id)" -ForegroundColor Green
    Write-Host "Order Status: $($orderRes.status)"
    Write-Host "Linked Payment ID: $($orderRes.paymentId)"
}
catch {
    Write-Host "Order Placement Failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)"
}
