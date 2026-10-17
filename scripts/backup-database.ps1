<#
.SYNOPSIS
  CareFlow Database & Private File Storage Backup Utility (Windows PowerShell)
.DESCRIPTION
  Performs timestamped backup of the CareFlow SQL database and encrypted private storage.
  Computes SHA-256 checksums for tamper-evident HIPAA compliance record-keeping.
.EXAMPLE
  .\scripts\backup-database.ps1
#>

param(
  [string]$DbPath = "$PSScriptRoot\..\server\prisma\dev.db",
  [string]$StoragePath = "$PSScriptRoot\..\server\storage\private",
  [string]$BackupDir = "$PSScriptRoot\..\backups",
  [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CareFlow Automated Database & Storage Backup ($Timestamp)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure backup directory exists
if (-not (Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
  Write-Host "[+] Created backup directory: $BackupDir" -ForegroundColor Green
}

# 2. Database Backup
$DbResolved = Resolve-Path $DbPath -ErrorAction SilentlyContinue
if ($DbResolved -and (Test-Path $DbResolved)) {
  $DbTarget = Join-Path $BackupDir "careflow_db_$Timestamp.db"
  Copy-Item -Path $DbResolved -Destination $DbTarget -Force
  
  # Compute SHA-256 Checksum
  $DbHash = (Get-FileHash -Path $DbTarget -Algorithm SHA256).Hash
  "$DbHash  careflow_db_$Timestamp.db" | Out-File -FilePath "$DbTarget.sha256" -Encoding ascii
  
  Write-Host "[OK] Database backed up successfully:" -ForegroundColor Green
  Write-Host "     File: $DbTarget" -ForegroundColor Gray
  Write-Host "     SHA-256: $DbHash" -ForegroundColor Yellow
} else {
  Write-Warning "[-] SQLite database not found at: $DbPath. Skipping DB copy."
}

# 3. Storage Archive Backup
$StorageResolved = Resolve-Path $StoragePath -ErrorAction SilentlyContinue
if ($StorageResolved -and (Test-Path $StorageResolved)) {
  $StorageTarget = Join-Path $BackupDir "careflow_storage_$Timestamp.zip"
  Compress-Archive -Path "$StorageResolved\*" -DestinationPath $StorageTarget -Force
  
  $StorageHash = (Get-FileHash -Path $StorageTarget -Algorithm SHA256).Hash
  "$StorageHash  careflow_storage_$Timestamp.zip" | Out-File -FilePath "$StorageTarget.sha256" -Encoding ascii
  
  Write-Host "[OK] Storage archive backed up successfully:" -ForegroundColor Green
  Write-Host "     File: $StorageTarget" -ForegroundColor Gray
  Write-Host "     SHA-256: $StorageHash" -ForegroundColor Yellow
} else {
  Write-Host "[i] No private storage files found at: $StoragePath" -ForegroundColor DarkGray
}

# 4. Enforce Retention Policy (Purge backups older than RetentionDays)
Write-Host "[*] Purging snapshots older than $RetentionDays days..." -ForegroundColor Gray
Get-ChildItem -Path $BackupDir -Filter "careflow_*" | Where-Object {
  $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays)
} | Remove-Item -Force

Write-Host "`n[OK] Backup operation completed successfully." -ForegroundColor Green
