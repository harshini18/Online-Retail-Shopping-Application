# Test User Service Login

$urlBase = "http://localhost:8081/api/users"

# 1. Login Admin
Write-Host "Logging in Admin..." -ForegroundColor Cyan
$adminBody = @{
    email    = "admin@retail.com"
    password = "password"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$urlBase/login" -Method Post -Body $adminBody -ContentType "application/json"
    Write-Host "Admin Login Success! Role: $($res.role)" -ForegroundColor Green
    if ($res.role -ne "ADMIN") { Write-Host "WARNING: Unexpected Role" -ForegroundColor Yellow }
}
catch {
    Write-Host "Admin Login Failed: $_" -ForegroundColor Red
}

# 2. Login User
Write-Host "`nLogging in Customer..." -ForegroundColor Cyan
$userBody = @{
    email    = "user@retail.com"
    password = "password"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$urlBase/login" -Method Post -Body $userBody -ContentType "application/json"
    Write-Host "User Login Success! Role: $($res.role)" -ForegroundColor Green
    if ($res.role -ne "CUSTOMER") { Write-Host "WARNING: Unexpected Role: $($res.role)" -ForegroundColor Yellow }
}
catch {
    Write-Host "User Login Failed: $_" -ForegroundColor Red
}
