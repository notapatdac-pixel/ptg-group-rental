# ============================================================
# Register a Windows Scheduled Task: PTG ML daily inference
# ============================================================
# Runs agent/ml/service/run_cron.py every day at 00:05 BKK (= 17:05 UTC).
# Re-runnable: if the task already exists this script overwrites it.
#
# Usage (PowerShell as the current user — no admin needed for user tasks):
#     cd agent/ml/service
#     .\schedule_daily_task.ps1
#
# Inspect / remove:
#     Get-ScheduledTask -TaskName 'PTG ML Daily Inference'
#     Unregister-ScheduledTask -TaskName 'PTG ML Daily Inference' -Confirm:$false
# ============================================================

$ErrorActionPreference = 'Stop'

$ServiceDir = (Resolve-Path "$PSScriptRoot").Path
$PythonExe  = Join-Path $ServiceDir '.venv\Scripts\python.exe'
$CronScript = Join-Path $ServiceDir 'run_cron.py'
$TaskName   = 'PTG ML Daily Inference'

if (-not (Test-Path $PythonExe)) {
    throw "Python venv not found at $PythonExe. Run 'python -m venv .venv' first."
}
if (-not (Test-Path $CronScript)) {
    throw "run_cron.py missing — expected $CronScript"
}

# Trigger: every day at 00:05 local time
$Trigger = New-ScheduledTaskTrigger -Daily -At '00:05'

# Action: run python with run_cron.py, start in the agent/ml/service dir
$Action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument 'run_cron.py' `
    -WorkingDirectory $ServiceDir

# Settings: skip if already running, retry on failure, no power restrictions
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 2 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Replace if exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask `
    -TaskName    $TaskName `
    -Description 'Runs PTG ML inference daily — writes predictions to Supabase ml_* tables.' `
    -Trigger     $Trigger `
    -Action      $Action `
    -Settings    $Settings `
    -RunLevel    Limited

Write-Host ""
Write-Host "Registered scheduled task '$TaskName'."
Write-Host "Next run: 00:05 tomorrow."
Write-Host ""
Write-Host "Test it now with:"
Write-Host "    Start-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
Write-Host "Logs at: $ServiceDir\logs\ml_cron_YYYY-MM-DD.log"
