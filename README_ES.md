# ContPaq-proPDF

Procesamiento de facturas con inteligencia artificial para ContPAQi, nativo de Windows.

## Descripción General

ContPaq-proPDF es una aplicación de escritorio que automatiza la extracción de datos de facturas usando IA y publica documentos directamente en ContPAQi. A diferencia de soluciones en la nube, se ejecuta completamente en Windows sin requerir Docker o WSL.

### Características Principales

- **Extracción con IA**: Utiliza LayoutLMv3 para extracción inteligente de campos de facturas
- **Soporte OCR**: Maneja facturas PDF tanto basadas en texto como escaneadas vía Tesseract
- **Integración ContPAQi**: Publicación directa a ContPAQi mediante COM SDK
- **Visualización de Confianza**: Puntuaciones de confianza con código de colores (verde/naranja/rojo)
- **Operación Sin Conexión**: Funciona sin conexión a internet después de la configuración inicial
- **Interfaz en Español**: Interfaz de usuario completamente en español

## Arquitectura

ContPaq-proPDF utiliza una arquitectura multi-proceso:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Aplicación de Escritorio                     │
│                       (Electron + React)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Subir     │  │   Revisar y  │  │   Publicar   │          │
│  │   Factura    │  │   Corregir   │  │   Documento  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │ HTTP/REST          │                    │ HTTP/REST
         ▼                    ▼                    ▼
┌─────────────────────┐              ┌─────────────────────┐
│   Servicio de IA    │              │   Windows Bridge    │
│  (Python/FastAPI)   │              │     (C#/.NET)       │
│                     │              │                     │
│  - Procesamiento    │              │  - SDK ContPAQi     │
│    de PDF           │              │  - Interop COM      │
│  - OCR (Tesseract)  │              │  - Publicación de   │
│  - LayoutLMv3       │              │    Documentos       │
└─────────────────────┘              └─────────────────────┘
```

### Componentes

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| App de Escritorio | Electron + React + TypeScript | Interfaz de usuario |
| Servicio de IA | Python + FastAPI | Procesamiento de facturas e IA |
| Windows Bridge | C# + .NET 8 | Integración con SDK de ContPAQi |
| Base de Datos | SQLite | Almacenamiento local de datos |
| Instalador | Inno Setup | Instalador de Windows |

## Requisitos del Sistema

### Requisitos Mínimos

- **SO**: Windows 10/11 (64-bit)
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Almacenamiento**: 2 GB para la aplicación + espacio para facturas
- **ContPAQi**: Versión 2022 o posterior instalada

### Prerrequisitos (Se instalan automáticamente)

- .NET 8.0 Desktop Runtime
- Visual C++ Redistributable 2022

## Instalación

### Instalación Rápida (Recomendado)

1. Ir a la página de [Releases](https://github.com/danribes/contpaq-win/releases)
2. Descargar el último `ContPaq-proPDF-X.X.X-Setup.exe`
3. Ejecutar el instalador como Administrador
4. Seguir el asistente de instalación
5. Iniciar ContPaq-proPDF desde el acceso directo del escritorio o Menú Inicio

> **Nota**: Los releases se compilan automáticamente vía GitHub Actions cuando se crean etiquetas de versión.

### Compilar desde Código Fuente

Si prefiere compilar localmente o desea contribuir:

1. **Clonar el repositorio** y asegurarse de tener todos los [Prerrequisitos de Desarrollo](#prerrequisitos)
2. **Compilar el instalador** ejecutando desde la raíz del repositorio:
   ```powershell
   .\build.ps1
   ```
3. **Ejecutar el instalador generado**:
   ```powershell
   # El instalador estará en:
   installer\output\ContPaq-proPDF-0.1.0-Setup.exe
   ```
4. **Ejecutar el instalador como Administrador** y seguir el asistente de instalación
5. **Iniciar ContPaq-proPDF** desde el acceso directo del escritorio o Menú Inicio

Para opciones detalladas de compilación, ver [Compilar el Instalador](#compilar-el-instalador) más abajo.

### Qué Hace el Instalador

El instalador:
- Instala los prerrequisitos (.NET 8.0, VC++ Redistributable) si es necesario
- Instala la aplicación de escritorio Electron
- Instala el Servicio de IA y Windows Bridge como servicios de Windows
- Instala Tesseract OCR para soporte de documentos escaneados
- Crea accesos directos en el escritorio y Menú Inicio

### Directorio de Instalación

Por defecto: `C:\Program Files\ContPaq-proPDF`

```
ContPaq-proPDF/
├── ContPaq proPDF.exe      # Aplicación principal
├── ai-service/          # Servicio de procesamiento de documentos con IA
├── windows-bridge/      # Bridge para SDK de ContPAQi
├── tesseract/           # Motor OCR
├── tools/               # Administrador de servicios NSSM
├── scripts/             # Scripts de administración de servicios
└── logs/                # Registros de la aplicación
```

### Servicios de Windows

Se instalan e inician automáticamente dos servicios:

| Servicio | Puerto | Propósito |
|----------|--------|-----------|
| ContPaqProPDFAIService | 8000 | Procesamiento de documentos con IA |
| ContPaqProPDFBridge | 5000 | Integración con SDK de ContPAQi |

Ambos servicios:
- Inician automáticamente con Windows
- Se reinician automáticamente en caso de fallo
- Escuchan solo en localhost (127.0.0.1)

### Archivos de Registro (Logs)

Los registros se almacenan en:
- `%LOCALAPPDATA%\ContPaq-proPDF\Logs\` - Registros de la aplicación (formato JSON)
- `%PROGRAMDATA%\ContPaq-proPDF\logs\` - Registros stdout/stderr de servicios

### Desinstalación

1. Usar Configuración de Windows > Aplicaciones > ContPaq-proPDF > Desinstalar, o
2. Ejecutar el desinstalador desde Menú Inicio > ContPaq-proPDF > Desinstalar

El desinstalador detendrá y eliminará ambos servicios de Windows.

## Configuración para Desarrollo

### Prerrequisitos

- **Python**: 3.11+
- **Node.js**: 20 LTS+
- **.NET**: 8.0 SDK
- **Git**: 2.40+
- **Inno Setup**: 6.x (para compilar el instalador)

### Clonar y Configurar

```bash
# Clonar el repositorio
git clone https://github.com/danribes/contpaq-win.git
cd contpaq-win

# Configurar el Servicio de IA (Python)
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Configurar la App de Escritorio (Node.js)
cd ../desktop-app
npm install

# Configurar Windows Bridge (.NET)
cd ../windows-bridge/src
dotnet restore
dotnet build
```

### Ejecutar en Desarrollo

```bash
# Terminal 1: Servicio de IA
cd ai-service
.venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Windows Bridge
cd windows-bridge/src/ContPaqProPDFBridge
dotnet run

# Terminal 3: App de Escritorio
cd desktop-app
npm run dev
```

### Compilar para Producción

```bash
# Compilar ejecutable del Servicio de IA
cd ai-service
pyinstaller --onefile --name contpaq-ai-service src/main.py

# Compilar Windows Bridge
cd windows-bridge/src
dotnet publish -c Release -r win-x64 --self-contained true

# Compilar app Electron
cd desktop-app
npm run build
npm run package
```

### Compilar el Instalador

#### Opción 1: Script de Compilación Automatizado (Recomendado)

Ejecutar el script de PowerShell desde la raíz del repositorio:

```powershell
.\build.ps1
```

El script:
- Verifica todas las herramientas requeridas
- Compila todos los componentes (Servicio IA, Windows Bridge, App de Escritorio)
- Compila el instalador de Inno Setup

Opciones:
```powershell
.\build.ps1 -Clean              # Recompilar desde cero
.\build.ps1 -SkipAIService      # Omitir compilación del Servicio IA
.\build.ps1 -SkipInstaller      # Solo compilar componentes, no el instalador
```

#### Opción 2: Compilación Manual

1. **Instalar Inno Setup 6.x** desde [jrsoftware.org](https://jrsoftware.org/isinfo.php)
2. **Compilar todos los componentes** (ver Compilar para Producción arriba)
3. **Ejecutar el compilador de Inno Setup**:
   ```powershell
   cd installer
   iscc contpaq-win.iss
   ```

El instalador se creará en `installer/output/ContPaq-proPDF-X.X.X-Setup.exe`

### Compilaciones Automatizadas (CI/CD)

El repositorio incluye un workflow de GitHub Actions que compila y publica automáticamente los instaladores cuando creas una etiqueta de release.

**Para crear un nuevo release:**

1. **Etiquetar el release**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **GitHub Actions automáticamente**:
   - Compilará todos los componentes (Servicio IA, Windows Bridge, App de Escritorio)
   - Compilará el instalador de Inno Setup
   - Creará un GitHub Release con el instalador adjunto

3. **Encuentra tu release** en la [página de Releases](https://github.com/danribes/contpaq-win/releases)

**Convenciones de nombres de versión:**
- `v1.0.0` - Release estable
- `v1.0.0-beta.1` - Release beta (marcado como pre-release)
- `v1.0.0-alpha.1` - Release alpha (marcado como pre-release)

**Ejecución manual del workflow:**
También puedes ejecutar la compilación manualmente desde la pestaña GitHub Actions sin crear una etiqueta.

## Estructura del Proyecto

```
contpaq-win/
├── ai-service/          # Servicio de IA en Python
│   ├── src/             # Código fuente
│   │   ├── api/         # Rutas de FastAPI
│   │   ├── services/    # Lógica de negocio
│   │   └── utils/       # Utilidades (logging, validación)
│   └── tests/           # Archivos de pruebas
├── desktop-app/         # Aplicación Electron/React
│   └── src/
│       ├── main/        # Proceso principal de Electron
│       └── renderer/    # Componentes de UI en React
├── windows-bridge/      # Bridge C#/.NET para ContPAQi
│   └── src/
│       ├── ContPaqProPDFBridge/        # Proyecto principal
│       └── ContPaqProPDFBridge.Tests/  # Pruebas
├── database/            # Base de datos SQLite
│   ├── migrations/      # Migraciones de esquema
│   └── seed/            # Datos de prueba
├── installer/           # Archivos de instalación
│   ├── contpaq-win.iss  # Script de Inno Setup
│   └── scripts/         # Scripts de instalación de servicios
├── specs/               # Especificaciones de características
└── tests/               # Pruebas entre componentes
```

## Pruebas

### Ejecutar Todas las Pruebas

```bash
# Pruebas de Python
cd ai-service
pytest

# Pruebas de Node.js
cd desktop-app
npm test

# Pruebas de .NET
cd windows-bridge/src
dotnet test
```

### Ejecutar Pruebas Específicas

```bash
# Python - módulo específico
pytest tests/ai_service/test_T031_1_1_json_logging.py -v

# Node.js - archivo de prueba específico
npm test -- --testPathPattern="HomePage"

# .NET - clase de prueba específica
dotnet test --filter "FullyQualifiedName~LoggingConfigurationTests"
```

## Solución de Problemas

### Los Servicios No Inician

1. Verificar el estado de los servicios:
   ```powershell
   Get-Service ContPaqProPDFAIService, ContPaqProPDFBridge
   ```

2. Revisar los registros:
   - `%PROGRAMDATA%\ContPaq-proPDF\logs\ai-service-stderr.log`
   - `%LOCALAPPDATA%\ContPaq-proPDF\Logs\windows-bridge-*.log`

3. Reiniciar los servicios:
   ```powershell
   Restart-Service ContPaqProPDFAIService, ContPaqProPDFBridge
   ```

### ContPAQi No Detectado

- Asegurarse de que ContPAQi esté instalado (versión 2022+)
- Verificar la ruta de instalación: `C:\Program Files (x86)\Compac` o `C:\Program Files\Compac`
- La aplicación funcionará pero la publicación a ContPAQi no estará disponible

### Conflictos de Puertos

Si los puertos 5000 u 8000 están en uso:
1. Detener los servicios en conflicto
2. O modificar los puertos en la configuración del servicio

## Estilo de Código

- **Python**: Black + Ruff (PEP 8)
- **TypeScript**: ESLint + Prettier
- **C#**: Convenciones de .NET

EditorConfig está configurado para formato consistente entre editores.

## Licencia

Propietario - Todos los derechos reservados.

## Soporte

Para reportar problemas y solicitar características, por favor use la página de [GitHub Issues](https://github.com/danribes/contpaq-win/issues).
