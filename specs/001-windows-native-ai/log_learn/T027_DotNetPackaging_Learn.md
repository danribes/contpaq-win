# T027 - .NET Packaging Learnings

**Task**: Package and deploy Windows Bridge .NET application
**Date**: 2025-12-18

## Key Learnings

### 1. Self-Contained Deployment

.NET 8 self-contained deployment bundles the runtime:

```xml
<PropertyGroup>
  <SelfContained>true</SelfContained>
  <RuntimeIdentifier>win-x64</RuntimeIdentifier>
</PropertyGroup>
```

**Benefits:**
- No .NET runtime prerequisite
- Consistent version across deployments
- Single installation process

**Trade-offs:**
- Larger file size (~150MB)
- Each app includes own runtime
- Must update for security patches

### 2. Single-File Publishing

Combine all files into one executable:

```xml
<PropertyGroup>
  <PublishSingleFile>true</PublishSingleFile>
  <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
  <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
</PropertyGroup>
```

**Key settings:**
- `IncludeNativeLibrariesForSelfExtract`: Bundles native DLLs
- `EnableCompressionInSingleFile`: Reduces file size
- `PublishReadyToRun`: Pre-compiles for faster startup

### 3. Publish Profiles

Create reusable publish configurations in `Properties/PublishProfiles/`:

```xml
<!-- win-x64.pubxml -->
<Project>
  <PropertyGroup>
    <Configuration>Release</Configuration>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishDir>bin\publish\win-x64\</PublishDir>
  </PropertyGroup>
</Project>
```

**Usage:**
```bash
dotnet publish -p:PublishProfile=win-x64
```

### 4. Trimming Considerations

**Important:** Disable trimming for COM interop:

```xml
<PublishTrimmed>false</PublishTrimmed>
```

Trimming can break:
- Reflection-based code
- COM interop
- Dynamic type loading
- Serialization with unknown types

The Windows Bridge uses COM for ContPAQi SDK, so trimming is disabled.

### 5. Native Windows Service vs NSSM

For .NET applications, use native Windows Service support:

**Advantages over NSSM:**
- No external dependency
- Better .NET integration
- Cleaner lifecycle management
- Built-in support in ASP.NET Core

**Creating with PowerShell:**
```powershell
$params = @{
    Name = "ContPAQWinBridge"
    BinaryPathName = "C:\path\ContPAQWinBridge.exe"
    DisplayName = "ContPAQ-Win Windows Bridge"
    StartupType = "Automatic"
    Description = "API bridge for ContPAQi SDK"
}
New-Service @params
```

### 6. Service Recovery Configuration

Configure restart on failure with sc.exe:

```powershell
# reset= days (86400 = 24 hours)
# actions= action/delay pairs in milliseconds
sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/5000/restart/5000
```

This sets:
- First failure: Restart after 5 seconds
- Second failure: Restart after 5 seconds
- Subsequent: Restart after 5 seconds
- Reset counter after 24 hours

### 7. ASP.NET Core as Windows Service

ASP.NET Core apps can run as services with minimal code:

```csharp
// Program.cs
builder.Host.UseWindowsService();
```

The application automatically:
- Responds to start/stop commands
- Logs to Windows Event Log
- Handles graceful shutdown

### 8. Service Account Security

**LocalSystem** (default):
- Full system access
- Risk: Overprivileged

**LocalService** (recommended for network services):
- Limited local access
- Anonymous network credentials

For localhost-only services, LocalSystem is acceptable.

### 9. PowerShell Script Automation

Use splatting for complex commands:

```powershell
$publishArgs = @(
    "publish"
    $ProjectFile
    "--configuration", $Configuration
    "--runtime", $RuntimeIdentifier
    "--self-contained", "true"
)
dotnet @publishArgs
```

This improves:
- Readability
- Maintainability
- Error handling

### 10. Debug Symbols in Production

Embed symbols for troubleshooting:

```xml
<DebugType>embedded</DebugType>
<DebugSymbols>true</DebugSymbols>
```

Embedded symbols:
- Included in executable
- Enable meaningful stack traces
- No separate .pdb file needed

## Comparison: Python (NSSM) vs .NET (Native)

| Aspect | Python + NSSM | .NET Native |
|--------|---------------|-------------|
| Dependencies | External NSSM | None |
| Installation | Complex | Simple |
| Logging | NSSM redirects | Event Log |
| Restart | NSSM config | sc.exe failure |
| Lifecycle | External control | Internal |
| Shutdown | Kill signal | Graceful |

## Common Issues

### 1. Service Won't Start
- Check Event Viewer for errors
- Verify executable path exists
- Check port availability

### 2. Access Denied Creating Service
- Run PowerShell as Administrator
- Check execution policy

### 3. Large Executable Size
- Enable compression
- Consider shared runtime deployment
- Accept size for simpler deployment

## Related Files

- `windows-bridge/src/ContPAQWinBridge/ContPAQWinBridge.csproj`
- `windows-bridge/src/ContPAQWinBridge/Properties/PublishProfiles/win-x64.pubxml`
- `windows-bridge/scripts/publish.ps1`
- `windows-bridge/scripts/install-service.ps1`
- `windows-bridge/scripts/uninstall-service.ps1`
