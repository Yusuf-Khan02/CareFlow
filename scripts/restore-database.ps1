<#
.SYNOPSIS
  CareFlow Database Restoration & Verification Utility (Windows PowerShell)
.DESCRIPTION
  Safely restores an existing SQL database backup after verifying its SHA-256 cryptographic checksum.
  Creates a safety pre-restoration rollback copy before applying the restored database.
.EXAMPLE
  .\scripts\restore-database.ps1 -BackupFile "backups\careflow_db_20261018_120000.db"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$BackupFile,
  [string]$DbTarget
)

$ErrorActionPreference = "Stop"

if (-not $DbTarget) {
  $DbTarget = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\server\prisma\dev.db"))
} else {
  $DbTarget = [System.IO.Path]::GetFullPath($DbTarget)
}

$BackupFile = [System.IO.Path]::GetFullPath($BackupFile)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CareFlow Automated Disaster Recovery & DB Restoration" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Validate Backup File Existence
if (-not (Test-Path $BackupFile)) {
  Write-Error "[-] Backup file not found: $BackupFile"
}

# 2. Checksum Verification
$ChecksumFile = "$BackupFile.sha256"
if (Test-Path $ChecksumFile) {
  Write-Host "[*] Verifying SHA-256 integrity checksum..." -ForegroundColor Gray
  $ExpectedHash = (Get-Content $ChecksumFile).Split(" ")[0].Trim().ToUpper()
  $ActualHash = (Get-FileHash -Path $BackupFile -Algorithm SHA256).Hash.ToUpper()

  if ($ExpectedHash -ne $ActualHash) {
    Write-Error "[-] Checksum mismatch! Backup file may be corrupted or tampered with.`nExpected: $ExpectedHash`nActual:   $ActualHash"
  }
  Write-Host "[OK] Integrity verified (SHA-256 matches: $ActualHash)" -ForegroundColor Green
} else {
  Write-Warning "[!] No .sha256 checksum file found. Proceeding with caution."
}

# 3. Create Pre-Restoration Rollback Safety Snapshot
if (Test-Path $DbTarget) {
  $SafetyBackup = "$DbTarget.pre_restore_safety_$(Get-Date -Format 'yyyyMMdd_HHmmss').bak"
  Copy-Item -Path $DbTarget -Destination $SafetyBackup -Force
  Write-Host "[OK] Pre-restoration rollback safety snapshot created: $SafetyBackup" -ForegroundColor DarkGray
}

# 4. Perform Database Restoration
Copy-Item -Path $BackupFile -Destination $DbTarget -Force
Write-Host "[OK] Database successfully restored to: $DbTarget" -ForegroundColor Green
Write-Host "     Source: $BackupFile" -ForegroundColor Gray
Write-Host "`n[OK] Restoration complete. Restart the application server to apply changes." -ForegroundColor Cyan
