# Test script for recommendation endpoint
# Run this after starting the RAG service

Write-Host "Testing RAG Recommendation Endpoint" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:4000/api"

# Test 1: Generate recommendations
Write-Host "Test 1: Generate Recommendations" -ForegroundColor Cyan
$body = @{
    supplier = "Supplier A"
    predicted = 120
    baseline = 60
    hotspot_reason = "High load + diesel fleet"
    event_type = "logistics"
    save_to_db = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/rag/recommend" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✓ Recommendations generated successfully" -ForegroundColor Green
    Write-Host "Root Cause: $($response.root_cause)" -ForegroundColor Yellow
    Write-Host "Actions Generated: $($response.actions.Count)" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($action in $response.actions) {
        Write-Host "  - $($action.title)" -ForegroundColor White
        Write-Host "    CO₂ Reduction: $($action.co2_reduction) kg" -ForegroundColor Gray
        Write-Host "    Cost Impact: $($action.cost_impact)" -ForegroundColor Gray
        Write-Host "    Feasibility: $($action.feasibility)/10" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "✗ Failed to generate recommendations" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""

# Test 2: Get all recommendations
Write-Host "Test 2: Get All Recommendations" -ForegroundColor Cyan
try {
    $recommendations = Invoke-RestMethod -Uri "$baseUrl/recommendations?limit=10" -Method GET
    Write-Host "✓ Retrieved $($recommendations.recommendations.Count) recommendations" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get recommendations" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 3: Health check
Write-Host "Test 3: Health Check" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET
    Write-Host "✓ Service is healthy" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "✗ Service health check failed" -ForegroundColor Red
}

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
