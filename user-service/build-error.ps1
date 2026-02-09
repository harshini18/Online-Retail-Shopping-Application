mvn clean compile 2>&1 | Out-File -FilePath error.txt
Get-Content error.txt
