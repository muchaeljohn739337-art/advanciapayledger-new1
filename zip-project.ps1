$src     = "C:\Users\mucha.DESKTOP-H7T9NPM\Downloads\mdsiles\myproject`$new"
$out     = "C:\Users\mucha.DESKTOP-H7T9NPM\Downloads\advancia-payledger-20260219.zip"
$exclude = @('node_modules','.next','dist','.git','coverage','build','.venv','__pycache__','*.zip')

Write-Host "Scanning files..." -ForegroundColor Cyan

$files = Get-ChildItem $src -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($ex in $exclude) {
        if ($path -like "*\$ex\*" -or $path -like "*\$ex") { $skip = $true; break }
    }
    -not $skip
}

$sizeMB = [math]::Round(($files | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
Write-Host "Files: $($files.Count)  |  Uncompressed: ${sizeMB} MB" -ForegroundColor Cyan

if (Test-Path $out) { Remove-Item $out -Force }

Write-Host "Compressing... (this may take 1-2 minutes)" -ForegroundColor Yellow

# Build temp folder structure to preserve relative paths
$tmp = Join-Path $env:TEMP "advancia_zip_tmp"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory $tmp | Out-Null

foreach ($file in $files) {
    $rel  = $file.FullName.Substring($src.Length + 1)
    $dest = Join-Path $tmp $rel
    $dir  = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory $dir -Force | Out-Null }
    Copy-Item $file.FullName $dest
}

Compress-Archive -Path "$tmp\*" -DestinationPath $out -CompressionLevel Optimal

Remove-Item $tmp -Recurse -Force

$zipMB = [math]::Round((Get-Item $out).Length / 1MB, 1)
Write-Host ""
Write-Host "Done! Zip: $out" -ForegroundColor Green
Write-Host "Size: ${zipMB} MB" -ForegroundColor Green
