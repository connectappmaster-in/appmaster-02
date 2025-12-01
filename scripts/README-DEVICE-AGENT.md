# AppMaster Device Update Agent

## Overview
This PowerShell script collects Windows Update information from devices and sends it to AppMaster for tracking and compliance monitoring.

## Features
- ✅ Collects device information (hostname, serial number, OS version)
- ✅ Scans for pending Windows updates
- ✅ Lists recently installed updates
- ✅ Detects failed update installations
- ✅ Sends data securely to AppMaster API
- ✅ Shows compliance status

## Installation

### 1. Download the Script
Save `device-update-agent.ps1` to a location on each device (e.g., `C:\AppMaster\`)

### 2. Test Manually
Open PowerShell as Administrator and run:
```powershell
cd C:\AppMaster
.\device-update-agent.ps1
```

### 3. Schedule Daily Execution

**Option A: Using Task Scheduler (Recommended)**

1. Open Task Scheduler (`taskschd.msc`)
2. Click "Create Task" (not "Create Basic Task")
3. **General tab:**
   - Name: `AppMaster Device Update Agent`
   - Description: `Daily sync of Windows Update status to AppMaster`
   - Select "Run whether user is logged on or not"
   - Check "Run with highest privileges"
4. **Triggers tab:**
   - New → Daily at 9:00 AM
   - Repeat task every: 1 day
5. **Actions tab:**
   - New → Start a program
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\AppMaster\device-update-agent.ps1"`
6. **Conditions tab:**
   - Uncheck "Start the task only if the computer is on AC power"
7. **Settings tab:**
   - Check "Run task as soon as possible after a scheduled start is missed"
8. Click OK and enter admin credentials

**Option B: Using Group Policy (Domain Environment)**

Deploy via GPO to all devices:
```
Computer Configuration → Preferences → Control Panel Settings → Scheduled Tasks
```

## Configuration

The API endpoint and key are pre-configured in the script:
```powershell
$API_ENDPOINT = "https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1/ingest-device-updates"
$API_KEY = "6q"^:I`0Zt!)acO1LrD@LLFam4FDWn"
```

⚠️ **Do not share the API key publicly!**

## What Gets Collected

### Device Information
- Hostname
- Serial number
- OS version and build
- Last boot time
- IP address

### Update Status
- **Pending updates**: Updates waiting to be installed (with KB numbers, titles, severity)
- **Installed updates**: Recently installed updates (last 50)
- **Failed updates**: Updates that failed to install (last 10 events)

## Viewing Results

After the script runs, check the AppMaster System Updates page:
- Navigate to: **HelpDesk → System Updates → Devices**
- Your device will appear with:
  - Compliance status (compliant/non-compliant)
  - Pending update count
  - Failed update count
  - Last check-in time

## Troubleshooting

### Script fails with "Execution Policy" error
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Script fails with "Access Denied"
- Ensure PowerShell is running as Administrator
- Check Windows Update service is running: `Get-Service wuauserv`

### No data appearing in AppMaster
1. Check script output for errors
2. Verify API key is correct
3. Ensure device has internet access
4. Check Task Scheduler history for execution status

### Script takes too long
- The Windows Update search can take 2-5 minutes on first run
- Subsequent runs are faster (30-60 seconds)

## Security Notes

- The API key is embedded in the script - protect it like a password
- Script requires Administrator privileges to access Windows Update API
- All data is sent over HTTPS
- No sensitive user data is collected

## Uninstallation

1. Delete the scheduled task from Task Scheduler
2. Remove the script file from `C:\AppMaster\`
3. (Optional) Remove device record from AppMaster web interface
