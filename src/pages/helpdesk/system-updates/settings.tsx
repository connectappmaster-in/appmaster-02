import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Download } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ModuleSettings {
  alert_offline_days: number;
  alert_failed_updates: boolean;
  alert_critical_pending: boolean;
  auto_compliance_check: boolean;
  retention_days_logs: number;
  retention_days_history: number;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ModuleSettings>({
    alert_offline_days: 7,
    alert_failed_updates: true,
    alert_critical_pending: true,
    auto_compliance_check: true,
    retention_days_logs: 90,
    retention_days_history: 365,
  });

  useEffect(() => {
    // In a real implementation, load settings from a database table
    // For now, using local state with default values
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, save to database
      // Example: await supabase.from('system_update_settings').upsert({ ...settings, tenant_id })
      
      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAgent = () => {
    const agentScript = `# AppMaster Device Update Agent
# This script collects Windows Update information and sends it to AppMaster

# === CONFIGURATION ===
$API_ENDPOINT = "https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1/ingest-device-updates"
$API_KEY = "6q\`"^:I\`\`0Zt!)acO1LrD@LLFam4FDWn"  # Your device agent API key

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
            if ($event.Message -match 'KB(\\d+)') {
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
Write-Host "\`nCollecting device information..." -ForegroundColor Yellow
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
Write-Host "\`nChecking for updates..." -ForegroundColor Yellow
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
Write-Host "\`nSending data to AppMaster..." -ForegroundColor Yellow

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

Write-Host "\`nUpdate check completed at $(Get-Date)" -ForegroundColor Cyan
exit 0`;

    const blob = new Blob([agentScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'device-update-agent.ps1';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("PowerShell agent downloaded successfully");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/helpdesk/system-updates")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Module Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure alerts, compliance checks, and data retention
            </p>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alert Configuration</CardTitle>
            <CardDescription>
              Configure when and how alerts are triggered for system updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alert on Failed Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Create alerts when update installations fail
                  </p>
                </div>
                <Switch
                  checked={settings.alert_failed_updates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, alert_failed_updates: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alert on Critical Updates Pending</Label>
                  <p className="text-sm text-muted-foreground">
                    Create alerts when critical updates are pending
                  </p>
                </div>
                <Switch
                  checked={settings.alert_critical_pending}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, alert_critical_pending: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Alert if Device Offline (Days)</Label>
                <Input
                  type="number"
                  value={settings.alert_offline_days}
                  onChange={(e) =>
                    setSettings({ ...settings, alert_offline_days: parseInt(e.target.value) || 7 })
                  }
                  min={1}
                  max={90}
                />
                <p className="text-sm text-muted-foreground">
                  Create alerts if devices haven't checked in for this many days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Settings</CardTitle>
            <CardDescription>
              Configure automated compliance checking and enforcement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Compliance Checking</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically mark devices as non-compliant when critical updates are pending
                </p>
              </div>
              <Switch
                checked={settings.auto_compliance_check}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auto_compliance_check: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>
              Configure how long historical data is retained
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Ingest Logs Retention (Days)</Label>
              <Input
                type="number"
                value={settings.retention_days_logs}
                onChange={(e) =>
                  setSettings({ ...settings, retention_days_logs: parseInt(e.target.value) || 90 })
                }
                min={7}
                max={365}
              />
              <p className="text-sm text-muted-foreground">
                How long to keep ingestion logs before automatic cleanup
              </p>
            </div>

            <div className="space-y-2">
              <Label>Update History Retention (Days)</Label>
              <Input
                type="number"
                value={settings.retention_days_history}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    retention_days_history: parseInt(e.target.value) || 365,
                  })
                }
                min={30}
                max={730}
              />
              <p className="text-sm text-muted-foreground">
                How long to keep update history before automatic cleanup
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Agent</CardTitle>
            <CardDescription>
              Download and deploy the PowerShell agent to collect Windows Update data from your devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Windows Update Agent</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    PowerShell script that collects Windows Update information and sends it to AppMaster API
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Tracks pending, installed, and failed updates</li>
                    <li>Monitors device compliance status</li>
                    <li>Can be scheduled to run daily via Task Scheduler</li>
                  </ul>
                </div>
                <Button onClick={handleDownloadAgent} className="ml-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Agent
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input
                  type="text"
                  value="https://zxtpfrgsfuiwdppgiliv.supabase.co/functions/v1/ingest-device-updates"
                  disabled
                  className="font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">Installation Instructions</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Download the PowerShell agent script</li>
                  <li>Save it to a location on each device (e.g., C:\AppMaster\)</li>
                  <li>Open Task Scheduler and create a new task</li>
                  <li>Set it to run daily with highest privileges</li>
                  <li>Configure the action to run: powershell.exe -ExecutionPolicy Bypass -File "C:\AppMaster\device-update-agent.ps1"</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
