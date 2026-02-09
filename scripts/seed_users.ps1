# Setup User Service Data with Health Check

$urlBase = "http://localhost:8081/api/users"

# 1. Wait for Service Health
Write-Host "Waiting for User Service..." -ForegroundColor Cyan
$retries = 0
$maxRetries = 30
while ($retries -lt $maxRetries) {
    try {
        $health = Invoke-RestMethod -Uri "$urlBase/health" -Method Get -ErrorAction Stop
        if ($health -eq "User Service is running") {
            Write-Host "Service is UP!" -ForegroundColor Green
            break
        }
    }
    catch {
        Write-Host "Waiting... ($($retries+1)/$maxRetries)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 2
        $retries++
    }
}

if ($retries -eq $maxRetries) {
    Write-Host "Service failed to start." -ForegroundColor Red
    exit
}

# 2. Register Admin User
Write-Host "`nRegistering Admin..." -ForegroundColor Cyan
$adminBody = @{
    email     = "admin@retail.com"
    password  = "password"
    role      = "ADMIN"
    firstName = "Admin"
    lastName  = "User"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$urlBase/register" -Method Post -Body $adminBody -ContentType "application/json"
    Write-Host "Admin Registered: $($res.email)" -ForegroundColor Green
}
catch {
    Write-Host "Admin Reg Failed: $_" -ForegroundColor Red
}

# 3. Register Customer User
Write-Host "`nRegistering Customer..." -ForegroundColor Cyan
$userBody = @{
    email     = "user@retail.com"
    password  = "password"
    role      = "CUSTOMER"
    firstName = "Test"
    lastName  = "User"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$urlBase/register" -Method Post -Body $userBody -ContentType "application/json"
    Write-Host "User Registered: $($res.email)" -ForegroundColor Green
}
catch {
    Write-Host "User Reg Failed: $_" -ForegroundColor Red
}
