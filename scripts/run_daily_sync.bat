@echo off
REM Madiff Outbound System - Daily 9:00 AM Automated Sync Trigger
echo [%date% %time%] Triggering Madiff daily 9:00 AM automated pipeline sync... >> "%~dp0daily_sync.log"
curl -s -X POST http://localhost:3000/api/sync/orchestrator -H "Content-Type: application/json" -d "{\"triggerSource\":\"windows_task_scheduler_9am\"}" >> "%~dp0daily_sync.log" 2>&1
echo. >> "%~dp0daily_sync.log"
