; =============================================================================
; ContPAQ-Win Installer Script
; =============================================================================
; T029.1 - Inno Setup installer for ContPAQ-Win application
;
; This script creates a Windows installer that:
; - Installs the Electron desktop application
; - Bundles AI service and Windows Bridge components
; - Installs Tesseract OCR
; - Creates Start Menu and Desktop shortcuts
; - Registers Windows services
;
; Build command:
;   iscc contpaq-win.iss
;
; Requirements:
;   - Inno Setup 6.x
;   - Built Electron app in desktop-app/release
;   - AI service executable in ai-service/dist
;   - Windows Bridge executable in windows-bridge/bin/publish
; =============================================================================

#define MyAppName "ContPAQ-Win"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "ContPAQ-Win Team"
#define MyAppURL "https://github.com/contpaq-win"
#define MyAppExeName "ContPAQ Win.exe"
#define MyAppId "{{8B9E7A5C-4D3F-2E1B-0A9C-8D7E6F5A4B3C}"

[Setup]
; Application identity
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation settings
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; License and info
LicenseFile=LICENSE_ES.txt
InfoBeforeFile=INFO_ES.txt

; Output settings
OutputDir=output
OutputBaseFilename=ContPAQ-Win-{#MyAppVersion}-Setup
SetupIconFile=assets\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

; Compression
Compression=lzma2/ultra64
SolidCompression=yes
LZMAUseSeparateProcess=yes

; Platform requirements
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
MinVersion=10.0

; Privileges
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog

; Appearance
WizardStyle=modern
WizardSizePercent=120
WindowVisible=no
ShowLanguageDialog=no

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

[Files]
; Desktop Application (Electron)
Source: "..\desktop-app\release\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; AI Service
Source: "..\ai-service\dist\*"; DestDir: "{app}\ai-service"; Flags: ignoreversion recursesubdirs createallsubdirs

; Windows Bridge
Source: "..\windows-bridge\src\ContPAQWinBridge\bin\publish\win-x64\*"; DestDir: "{app}\windows-bridge"; Flags: ignoreversion recursesubdirs createallsubdirs

; Tesseract OCR
Source: "..\desktop-app\resources\tesseract\*"; DestDir: "{app}\tesseract"; Flags: ignoreversion recursesubdirs createallsubdirs

; NSSM for AI service
Source: "tools\nssm.exe"; DestDir: "{app}\tools"; Flags: ignoreversion

; Service scripts
Source: "scripts\install-services.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion
Source: "scripts\uninstall-services.ps1"; DestDir: "{app}\scripts"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"; Permissions: users-modify

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: quicklaunchicon

[Run]
; Install and start services after installation
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\install-services.ps1"""; StatusMsg: "Instalando servicios..."; Flags: runhidden waituntilterminated

; Launch application after install (optional)
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; Stop and remove services before uninstall
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\uninstall-services.ps1"""; Flags: runhidden waituntilterminated

[Code]
// Check if .NET 8.0 Runtime is installed
function IsDotNet8Installed(): Boolean;
var
  Version: String;
begin
  Result := RegQueryStringValue(HKLM, 'SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedhost', 'Version', Version);
  if Result then
    Result := (CompareStr(Version, '8.0') >= 0);
end;

// Check if ContPAQi is installed
function IsContPAQiInstalled(): Boolean;
begin
  Result := DirExists('C:\Program Files (x86)\Compac') or
            DirExists('C:\Program Files\Compac') or
            RegKeyExists(HKLM, 'SOFTWARE\Compac');
end;

// Custom wizard page warning
procedure InitializeWizard();
begin
  // Could add custom warning pages here
end;

// Pre-installation checks
function InitializeSetup(): Boolean;
begin
  Result := True;

  // Warn if ContPAQi not detected
  if not IsContPAQiInstalled() then
  begin
    if MsgBox('ContPAQi no ha sido detectado en este equipo.' + #13#10 +
              'La aplicación requiere ContPAQi instalado para funcionar correctamente.' + #13#10#13#10 +
              '¿Desea continuar de todos modos?',
              mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
      Exit;
    end;
  end;
end;

// Post-installation message
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Services are installed by PowerShell script
  end;
end;
