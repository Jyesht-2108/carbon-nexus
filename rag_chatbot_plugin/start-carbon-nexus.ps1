# Start Carbon Nexus RAG Plugin with isolated services

Write-Host "Starting Carbon Nexus RAG Plugin Services" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting isolated services..." -ForegroundColor Cyan
Write-Host "  - Qdrant (port 6334)" -ForegroundColor Gray
Write-Host "  - Redis (port 6380)" -ForegroundColor Gray
Write-Host ""

# Start Docker Compose
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Wait for services to be ready
    Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
    Start-Sleep -Seconds 3
    
    # Check Qdrant
    Write-Host ""
    Write-Host "Checking Qdrant..." -ForegroundColor Cyan
    try {
        $qdrant = Invoke-RestMethod -Uri "http://localhost:6334/" -TimeoutSec 5
        Write-Host "✓ Qdrant is ready (version: $($qdrant.version))" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Qdrant is starting... (may take a few more seconds)" -ForegroundColor Yellow
    }
    
    # Check Redis
    Write-Host ""
    Write-Host "Checking Redis..." -ForegroundColor Cyan
    try {
        $redis = docker exec redis-carbon-nexus redis-cli ping 2>$null
        if ($redis -eq "PONG") {
            Write-Host "✓ Redis is ready" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Redis is starting..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Services Status:" -ForegroundColor Green
    Write-Host ""
    docker-compose ps
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Next Steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Install dependencies:" -ForegroundColor White
    Write-Host "   npm install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Configure .env file with your credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Start RAG service:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Test the service:" -ForegroundColor White
    Write-Host "   .\test-recommend.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Cyan
    Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  Stop:         docker-compose down" -ForegroundColor Gray
    Write-Host "  Restart:      docker-compose restart" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Red
    exit 1
}
