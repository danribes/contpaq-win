# NSSM - Non-Sucking Service Manager

This directory is for the NSSM executable used to install the AI service
as a Windows Service.

## Download NSSM

NSSM is not included in the repository due to licensing. Download it from:

- **Official Site**: https://nssm.cc/download
- **GitHub Mirror**: https://github.com/kirillkovalenko/nssm/releases

## Installation

1. Download the latest NSSM release (e.g., `nssm-2.24.zip`)
2. Extract `nssm.exe` from the `win64` folder to this directory
3. Run the install script: `.\install-service.ps1`

## File Structure

After downloading, this directory should contain:

```
nssm/
  README.md       # This file
  nssm.exe        # NSSM executable (not in repo)
```

## What NSSM Does

NSSM wraps any Windows executable as a Windows Service, providing:

- **Auto-start**: Service starts when Windows boots
- **Auto-restart**: Restarts the service if it crashes
- **Logging**: Redirects stdout/stderr to log files
- **Graceful Shutdown**: Properly terminates the application

## Service Configuration

The install script configures:

| Setting | Value |
|---------|-------|
| Service Name | ContPAQWinAIService |
| Display Name | ContPAQ-Win AI Service |
| Startup Type | Automatic |
| Restart on Failure | Yes (5 second delay) |
| Log Directory | %PROGRAMDATA%\ContPAQ-Win\logs |

## Manual Installation

If you prefer manual installation:

```powershell
# Install service
.\nssm.exe install ContPAQWinAIService "C:\path\to\contpaq-ai-service.exe"

# Configure service
.\nssm.exe set ContPAQWinAIService Description "AI-powered invoice processing"
.\nssm.exe set ContPAQWinAIService AppDirectory "C:\path\to\contpaq-ai-service"
.\nssm.exe set ContPAQWinAIService AppExit Default Restart
.\nssm.exe set ContPAQWinAIService AppRestartDelay 5000

# Start service
.\nssm.exe start ContPAQWinAIService
```

## Troubleshooting

### Service Won't Start
- Check logs in `%PROGRAMDATA%\ContPAQ-Win\logs`
- Verify the executable path is correct
- Ensure port 8000 is not in use

### Service Keeps Restarting
- Check stdout.log for application errors
- Verify Python dependencies are bundled correctly

### Permission Issues
- Run PowerShell as Administrator
- Ensure the service account has access to the application directory
