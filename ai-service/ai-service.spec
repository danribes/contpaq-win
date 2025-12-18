# -*- mode: python ; coding: utf-8 -*-
"""
T026.1.1 - PyInstaller Spec File for ContPAQ-Win AI Service

This spec file configures PyInstaller to build a standalone Windows
executable for the AI invoice processing service.

Build with:
    pyinstaller ai-service.spec

Or use the build script:
    python scripts/build.py
"""

import os
import sys
from pathlib import Path

# Get the directory containing this spec file
SPEC_DIR = Path(SPECPATH)

# Define paths
SRC_DIR = SPEC_DIR / 'src'
MODELS_DIR = SPEC_DIR / 'models'

# =============================================================================
# Hidden Imports
# =============================================================================
# PyInstaller doesn't automatically detect dynamically imported modules.
# We need to explicitly list them here.

hidden_imports = [
    # FastAPI and dependencies
    'fastapi',
    'fastapi.middleware',
    'fastapi.middleware.cors',
    'starlette',
    'starlette.routing',
    'starlette.middleware',
    'starlette.middleware.cors',
    'starlette.responses',
    'starlette.requests',
    'starlette.staticfiles',
    'starlette.templating',
    'uvicorn',
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',

    # Pydantic
    'pydantic',
    'pydantic.fields',
    'pydantic_settings',

    # PyTorch (CPU-only)
    'torch',
    'torch.nn',
    'torch.nn.functional',
    'torch.utils',
    'torch.utils.data',

    # Transformers (HuggingFace)
    'transformers',
    'transformers.models',
    'transformers.models.layoutlmv3',
    'transformers.models.layoutlmv3.modeling_layoutlmv3',
    'transformers.models.layoutlmv3.configuration_layoutlmv3',
    'transformers.models.layoutlmv3.tokenization_layoutlmv3',
    'transformers.models.layoutlmv3.processing_layoutlmv3',
    'transformers.tokenization_utils',
    'transformers.tokenization_utils_base',
    'transformers.feature_extraction_utils',
    'transformers.image_processing_utils',

    # PDF Processing
    'fitz',  # PyMuPDF
    'pymupdf',

    # OCR
    'pytesseract',

    # Image Processing
    'PIL',
    'PIL.Image',
    'PIL.ImageFilter',
    'PIL.ImageOps',
    'PIL.ImageEnhance',

    # Async support
    'aiofiles',
    'python_multipart',
    'multipart',

    # Standard library modules that might be missed
    'logging.handlers',
    'concurrent.futures',
    'asyncio',
    'json',
    'typing',
    'typing_extensions',
    'dataclasses',
    'enum',
    'pathlib',

    # Our application modules
    'src',
    'src.main',
    'src.api',
    'src.api.routes',
    'src.config',
    'src.lifecycle',
    'src.middleware',
    'src.middleware.logging',
    'src.models',
    'src.models.extraction',
    'src.models.validation',
    'src.services',
    'src.services.pdf_extractor',
    'src.services.ocr_service',
    'src.services.image_preprocessor',
    'src.services.ai_extractor',
    'src.services.line_item_extractor',
    'src.services.extraction_service',
    'src.utils',
    'src.utils.confidence',
    'src.utils.validation',
    'src.uvicorn_config',
]

# =============================================================================
# Data Files
# =============================================================================
# Additional files to include in the distribution

datas = [
    # Include the models directory if it exists
    # (str(MODELS_DIR), 'models'),
]

# Add models directory if it exists
if MODELS_DIR.exists():
    datas.append((str(MODELS_DIR), 'models'))

# =============================================================================
# Binary Files
# =============================================================================
# Additional binary files (.dll, .so) to include

binaries = []

# =============================================================================
# Analysis
# =============================================================================

a = Analysis(
    [str(SRC_DIR / 'main.py')],
    pathex=[str(SRC_DIR), str(SPEC_DIR)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary modules to reduce size
        'tkinter',
        'matplotlib',
        'scipy',
        'pandas',
        'numpy.testing',
        'IPython',
        'jupyter',
        'notebook',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

# =============================================================================
# PYZ Archive
# =============================================================================

pyz = PYZ(
    a.pure,
    a.zipped_data,
    cipher=None,
)

# =============================================================================
# Executable
# =============================================================================

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,  # Use COLLECT for folder mode
    name='contpaq-ai-service',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Keep console for service logging
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon path here if available
)

# =============================================================================
# Collect (Folder Mode)
# =============================================================================
# Creates a folder distribution instead of a single executable.
# This is preferred for services with many dependencies.

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='contpaq-ai-service',
)
