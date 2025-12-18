#!/usr/bin/env python3
"""
T026.1 - Build Script for ContPAQ-Win AI Service

This script packages the AI service as a standalone Windows executable
using PyInstaller. It handles:
- Checking prerequisites
- Downloading model weights if needed
- Running PyInstaller with the spec file
- Post-build validation

Usage:
    python scripts/build.py [--clean] [--no-models]

Options:
    --clean       Remove build artifacts before building
    --no-models   Skip model weight bundling (smaller build for testing)
"""

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

# Script directory and project root
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DIST_DIR = PROJECT_ROOT / "dist"
BUILD_DIR = PROJECT_ROOT / "build"
SPEC_FILE = PROJECT_ROOT / "ai-service.spec"
MODELS_DIR = PROJECT_ROOT / "models"


def log(message: str) -> None:
    """Print a log message."""
    print(f"[BUILD] {message}")


def error(message: str) -> None:
    """Print an error message and exit."""
    print(f"[ERROR] {message}", file=sys.stderr)
    sys.exit(1)


def check_prerequisites() -> None:
    """Check that all prerequisites are available."""
    log("Checking prerequisites...")

    # Check Python version
    if sys.version_info < (3, 11):
        error(f"Python 3.11+ required, found {sys.version}")

    # Check PyInstaller
    try:
        import PyInstaller
        log(f"  PyInstaller: {PyInstaller.__version__}")
    except ImportError:
        error("PyInstaller not installed. Run: pip install pyinstaller")

    # Check spec file
    if not SPEC_FILE.exists():
        error(f"Spec file not found: {SPEC_FILE}")

    log("  Prerequisites OK")


def clean_build() -> None:
    """Remove build artifacts."""
    log("Cleaning build artifacts...")

    for directory in [DIST_DIR, BUILD_DIR]:
        if directory.exists():
            log(f"  Removing {directory}")
            shutil.rmtree(directory)

    # Remove __pycache__ directories
    for pycache in PROJECT_ROOT.rglob("__pycache__"):
        if pycache.is_dir():
            shutil.rmtree(pycache)

    log("  Clean complete")


def download_models() -> None:
    """Download LayoutLMv3 model weights if not present."""
    log("Checking model weights...")

    config_file = MODELS_DIR / "layoutlm" / "config.json"

    if config_file.exists():
        log("  Model weights already present")
        return

    log("  Downloading LayoutLMv3 model weights...")
    log("  This may take a few minutes...")

    # Create models directory
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    layoutlm_dir = MODELS_DIR / "layoutlm"
    layoutlm_dir.mkdir(exist_ok=True)

    try:
        from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor

        # Download and save model
        model_name = "microsoft/layoutlmv3-base"
        log(f"  Downloading from {model_name}...")

        processor = LayoutLMv3Processor.from_pretrained(model_name)
        model = LayoutLMv3ForTokenClassification.from_pretrained(model_name)

        processor.save_pretrained(str(layoutlm_dir))
        model.save_pretrained(str(layoutlm_dir))

        log("  Model weights downloaded successfully")

    except Exception as e:
        log(f"  Warning: Could not download models: {e}")
        log("  Build will continue without bundled models")
        log("  Models will be downloaded at runtime if MODEL_PATH not set")


def run_pyinstaller() -> None:
    """Run PyInstaller with the spec file."""
    log("Running PyInstaller...")

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--clean",
        "--noconfirm",
        str(SPEC_FILE),
    ]

    log(f"  Command: {' '.join(cmd)}")

    result = subprocess.run(
        cmd,
        cwd=str(PROJECT_ROOT),
        capture_output=False,
    )

    if result.returncode != 0:
        error("PyInstaller failed")

    log("  PyInstaller complete")


def validate_build() -> None:
    """Validate the build output."""
    log("Validating build...")

    exe_dir = DIST_DIR / "contpaq-ai-service"
    exe_file = exe_dir / "contpaq-ai-service.exe"

    if not exe_dir.exists():
        error(f"Build directory not found: {exe_dir}")

    if not exe_file.exists():
        error(f"Executable not found: {exe_file}")

    # Check size (should be > 100MB with PyTorch)
    exe_size_mb = exe_file.stat().st_size / (1024 * 1024)
    log(f"  Executable size: {exe_size_mb:.1f} MB")

    # List key files
    log("  Key files:")
    for item in sorted(exe_dir.iterdir())[:10]:
        log(f"    - {item.name}")

    log("  Build validation complete")


def print_usage() -> None:
    """Print usage instructions for the built executable."""
    print()
    print("=" * 60)
    print("BUILD COMPLETE")
    print("=" * 60)
    print()
    print("Output directory: dist/contpaq-ai-service/")
    print()
    print("To run the service:")
    print("  cd dist/contpaq-ai-service")
    print("  contpaq-ai-service.exe")
    print()
    print("The service will start on http://127.0.0.1:8000")
    print()
    print("For Windows Service installation, see T026.2")
    print("=" * 60)


def main() -> None:
    """Main build process."""
    parser = argparse.ArgumentParser(description="Build ContPAQ-Win AI Service")
    parser.add_argument("--clean", action="store_true", help="Clean before build")
    parser.add_argument("--no-models", action="store_true", help="Skip model bundling")
    args = parser.parse_args()

    log("ContPAQ-Win AI Service Build")
    log(f"Project root: {PROJECT_ROOT}")

    # Check prerequisites
    check_prerequisites()

    # Clean if requested
    if args.clean:
        clean_build()

    # Download models unless skipped
    if not args.no_models:
        download_models()

    # Run PyInstaller
    run_pyinstaller()

    # Validate build
    validate_build()

    # Print usage
    print_usage()


if __name__ == "__main__":
    main()
