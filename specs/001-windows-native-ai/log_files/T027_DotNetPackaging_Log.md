# T027 - .NET Packaging Implementation Log

**Task**: Package and deploy Windows Bridge .NET application
**Date**: 2025-12-18
**Status**: Completed

## Files Created/Modified

### T027.1 - Publish .NET Application

**1. `windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj` (modified)**
- Added self-contained deployment configuration
- Added single-file publishing
- Added compression and ReadyToRun optimization
- Runtime identifier: win-x64

**2. `windows-bridge/src/ContPAQWinBridge/Properties/PublishProfiles/win-x64.pubxml` (created)**
- Windows x64 publish profile
- Release configuration
- Self-contained with single file output
- Embedded debug symbols

**3. `windows-bridge/scripts/publish.ps1` (created)**
- PowerShell build/publish automation
- Prerequisite checking (.NET SDK)
- Clean build option
- Output verification

### T027.2 - Service Registration

**4. `windows-bridge/scripts/install-service.ps1` (created)**
- Windows Service installation using New-Service
- Configures localhost-only binding (127.0.0.1:5000)
- Sets automatic startup type
- Configures restart on failure (5 second delay)

**5. `windows-bridge/scripts/uninstall-service.ps1` (created)**
- Graceful service stop
- Service removal with sc.exe
- Optional log cleanup

### Tests

**6. `tests/windows_bridge/test_T027_1_dotnet_packaging.py`** - 14 tests
**7. `tests/windows_bridge/test_T027_2_service_registration.py`** - 13 tests

## Configuration Details

### Publish Configuration

```xml
<PropertyGroup>
  <SelfContained>true</SelfContained>
  <PublishSingleFile>true</PublishSingleFile>
  <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
  <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
  <RuntimeIdentifier>win-x64</RuntimeIdentifier>
  <PublishReadyToRun>true</PublishReadyToRun>
</PropertyGroup>
```

### Service Configuration

| Setting | Value |
|---------|-------|
| Service Name | ContPAQWinBridge |
| Display Name | ContPAQ-Win Windows Bridge |
| Host | 127.0.0.1 |
| Port | 5000 |
| Startup Type | Automatic |
| Recovery | Restart after 5 seconds |

## Usage

### Build and Publish

```powershell
cd windows-bridge\scripts
.\publish.ps1 -Clean
```

Output: `src\ContPAQWinBridge\bin\publish\win-x64\ContPAQWinBridge.exe`

### Install Service

```powershell
.\install-service.ps1
# or with custom path
.\install-service.ps1 -ServicePath "C:\path\to\ContPAQWinBridge.exe"
```

### Uninstall Service

```powershell
.\uninstall-service.ps1
# or with log removal
.\uninstall-service.ps1 -RemoveLogs
```

### Manual Commands

```powershell
# Build
dotnet publish -c Release -r win-x64 --self-contained

# Service management
Start-Service ContPAQWinBridge
Stop-Service ContPAQWinBridge
Get-Service ContPAQWinBridge
```

## Notes

- Self-contained deployment includes .NET runtime (~150MB)
- Single file output simplifies deployment
- ReadyToRun improves startup time
- Trimming disabled to preserve COM interop compatibility
- Service binds to localhost only for security
