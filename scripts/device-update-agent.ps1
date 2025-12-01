# AppMaster Device Update Agent
# This script collects Windows Update information and sends it to AppMaster

# === CONFIGURATION ===
$API_ENDPOINT = "https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1/ingest-device-updates"
$API_KEY = "6q`"^:I``0Zt!)acO1LrD@LLFam4FDWn"  # Your device agent API key

# === FUNCTIONS ===

function Get-PendingUpdates {
    try {
        $updateSession = New-Object -ComObject Microsoft.Update.Session
        $updateSearcher = $updateSession.CreateUpdateSearcher()
        $searchResult = $updateSearcher.Search("IsInstalled=0 and Type='Software'")
        
        $updates = @()
        foreach ($update in $searchResult.Updates) {
            $kbNumber = "Unknown"
            if ($update.KBArticleIDs.Count -gt 0) {
                $kbNumber = "KB" + $update.KBArticleIDs[0]
            }
            
            $severity = "Unknown"
            if ($update.MsrcSeverity) {
                $severity = $update.MsrcSeverity
            }
            
            $updates += @{
                kb_number = $kbNumber
                title = $update.Title
                severity = $severity
                size_mb = [math]::Round($update.MaxDownloadSize / 1MB, 2)
            }
        }
        return $updates
    }
    catch {
        Write-Warning "Error getting pending updates: $_"
        return @()
    }
}

function Get-InstalledUpdates {
    try {
        $updates = @()
        $hotfixes = Get-HotFix | Select-Object -First 50 | Sort-Object InstalledOn -Descending
        
        foreach ($hotfix in $hotfixes) {
            if ($hotfix.HotFixID -and $hotfix.InstalledOn) {
                $updates += @{
                    kb_number = $hotfix.HotFixID
                    title = $hotfix.Description
                    installed_date = $hotfix.InstalledOn.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            }
        }
        return $updates
    }
    catch {
        Write-Warning "Error getting installed updates: $_"
        return @()
    }
}

function Get-FailedUpdates {
    try {
        $updates = @()
        $events = Get-WinEvent -FilterHashtable @{
            LogName = 'System'
            ProviderName = 'Microsoft-Windows-WindowsUpdateClient'
            ID = 20
        } -MaxEvents 10 -ErrorAction SilentlyContinue
        
        foreach ($event in $events) {
            if ($event.Message -match 'KB(\d+)') {
                $kbNumber = "KB" + $Matches[1]
                $updates += @{
                    kb_number = $kbNumber
                    title = "Failed update"
                    error_code = $event.Id.ToString()
                }
            }
        }
        return $updates
    }
    catch {
        Write-Warning "Error getting failed updates: $_"
        return @()
    }
}

# === MAIN SCRIPT ===

Write-Host "=== AppMaster Device Update Agent ===" -ForegroundColor Cyan
Write-Host "Starting update check at $(Get-Date)" -ForegroundColor Gray

# Collect device information
Write-Host "`nCollecting device information..." -ForegroundColor Yellow
$computerInfo = Get-ComputerInfo
$hostname = $env:COMPUTERNAME
$serialNumber = (Get-CimInstance Win32_BIOS).SerialNumber
$osVersion = $computerInfo.OSDisplayVersion
$osBuild = $computerInfo.OSBuildNumber
$lastBootTime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToString("yyyy-MM-ddTHH:mm:ss")
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress

Write-Host "Hostname: $hostname" -ForegroundColor Gray
Write-Host "Serial Number: $serialNumber" -ForegroundColor Gray
Write-Host "OS Version: $osVersion (Build $osBuild)" -ForegroundColor Gray

# Collect update information
Write-Host "`nChecking for updates..." -ForegroundColor Yellow
$pendingUpdates = Get-PendingUpdates
$installedUpdates = Get-InstalledUpdates
$failedUpdates = Get-FailedUpdates

Write-Host "Pending updates: $($pendingUpdates.Count)" -ForegroundColor $(if ($pendingUpdates.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Recently installed: $($installedUpdates.Count)" -ForegroundColor Gray
Write-Host "Failed updates: $($failedUpdates.Count)" -ForegroundColor $(if ($failedUpdates.Count -gt 0) { "Red" } else { "Green" })

# Build payload
$payload = @{
    hostname = $hostname
    serial_number = $serialNumber
    os_version = $osVersion
    os_build = $osBuild
    last_boot_time = $lastBootTime
    ip_address = $ipAddress
    pending_updates = $pendingUpdates
    installed_updates = $installedUpdates
    failed_updates = $failedUpdates
} | ConvertTo-Json -Depth 10

# Send to AppMaster
Write-Host "`nSending data to AppMaster..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $API_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Headers $headers -Body $payload -TimeoutSec 30
    
    Write-Host "✓ Success! Device synced successfully" -ForegroundColor Green
    Write-Host "  Device ID: $($response.device_id)" -ForegroundColor Gray
    Write-Host "  Compliance Status: $($response.compliance_status)" -ForegroundColor $(if ($response.compliance_status -eq "compliant") { "Green" } else { "Red" })
    Write-Host "  Updates Processed: $($response.updates_processed)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Error sending data: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "`nUpdate check completed at $(Get-Date)" -ForegroundColor Cyan
exit 0
