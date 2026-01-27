# Cloudflare DNS Setup Script for Advancia Pay Ledger
# Account ID: 74ecde4d46d4b399c7295cf599d2886b
# Zone ID: 0bff66558872c58ed5b8b7942acc34d9

param(
    [Parameter(Mandatory=$true)]
    [string]$APIToken,
    
    [Parameter(Mandatory=$true)]
    [string]$VercelIP
)

# Configuration
$ZONE_ID = "0bff66558872c58ed5b8b7942acc34d9"
$BASE_URL = "https://api.cloudflare.com/client/v4"

$headers = @{
    "Authorization" = "Bearer $APIToken"
    "Content-Type" = "application/json"
}

Write-Host "🚀 Setting up Cloudflare DNS for Advancia Pay Ledger..." -ForegroundColor Blue
Write-Host "Zone ID: $ZONE_ID" -ForegroundColor Gray
Write-Host "Vercel IP: $VercelIP" -ForegroundColor Gray

# DNS Records to create
$dnsRecords = @(
    @{
        type = "A"
        name = "@"
        content = $VercelIP
        ttl = 3600
        proxied = $true
        comment = "Root domain - Vercel frontend"
    },
    @{
        type = "CNAME"
        name = "www"
        content = "cname.vercel-dns.com"
        ttl = 3600
        proxied = $true
        comment = "WWW subdomain - Vercel"
    },
    @{
        type = "A"
        name = "api"
        content = "147.182.193.11"
        ttl = 3600
        proxied = $true
        comment = "API subdomain - DigitalOcean backend"
    }
)

# Function to create DNS record
function Create-DNSRecord($record) {
    $body = @{
        type = $record.type
        name = $record.name
        content = $record.content
        ttl = $record.ttl
        proxied = $record.proxied
        comment = $record.comment
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/zones/$ZONE_ID/dns_records" -Method Post -Headers $headers -Body $body
        Write-Host "✅ Created $($record.type) record: $($record.name) -> $($record.content)" -ForegroundColor Green
        return $response.result
    } catch {
        Write-Host "❌ Failed to create $($record.type) record: $($record.name)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to check if record already exists
function Get-ExistingRecord($type, $name) {
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/zones/$ZONE_ID/dns_records?type=$type&name=$name" -Method Get -Headers $headers
        return $response.result | Select-Object -First 1
    } catch {
        return $null
    }
}

# Create each DNS record
foreach ($record in $dnsRecords) {
    Write-Host "`n📋 Creating $($record.type) record for $($record.name)..." -ForegroundColor Yellow
    
    # Check if record already exists
    $existing = Get-ExistingRecord -type $record.type -name $record.name
    if ($existing) {
        Write-Host "⚠️  Record already exists: $($existing.name) -> $($existing.content)" -ForegroundColor Yellow
        Write-Host "   ID: $($existing.id)" -ForegroundColor Gray
        $choice = Read-Host "   Delete and recreate? (y/N)"
        if ($choice -eq 'y') {
            try {
                Invoke-RestMethod -Uri "$BASE_URL/zones/$ZONE_ID/dns_records/$($existing.id)" -Method Delete -Headers $headers | Out-Null
                Write-Host "   Deleted existing record" -ForegroundColor Orange
                Create-DNSRecord -record $record
            } catch {
                Write-Host "   Failed to delete existing record: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Create-DNSRecord -record $record
    }
}

# Verify setup
Write-Host "`n🔍 Verifying DNS setup..." -ForegroundColor Blue
try {
    $records = Invoke-RestMethod -Uri "$BASE_URL/zones/$ZONE_ID/dns_records" -Method Get -Headers $headers
    Write-Host "✅ Current DNS records:" -ForegroundColor Green
    
    $targetRecords = @("@", "www", "api")
    foreach ($name in $targetRecords) {
        $record = $records.result | Where-Object { $_.name -eq $name -or $_.name -eq "$name.advanciapayledger.com" }
        if ($record) {
            $status = if ($record.proxied) { "☁️ Proxied" } else { "🌐 DNS only" }
            Write-Host "   $($record.type.ToUpper()) $($record.name) -> $($record.content) [$status]" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Missing record for: $name" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Failed to verify DNS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 DNS setup complete!" -ForegroundColor Green
Write-Host "📚 Next steps:" -ForegroundColor Blue
Write-Host "   1. Wait 5-15 minutes for DNS propagation" -ForegroundColor Gray
Write-Host "   2. Test: https://advanciapayledger.com" -ForegroundColor Gray
Write-Host "   3. Test: https://api.advanciapayledger.com/api/health" -ForegroundColor Gray
Write-Host "   4. Check SSL certificates (auto-generated)" -ForegroundColor Gray
