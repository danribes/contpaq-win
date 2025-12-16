"""
ContPAQ-Win AI Service - Main Application

This module initializes the FastAPI application for the AI invoice
processing service. It configures the application with proper metadata,
includes all API routes, and sets up middleware for production use.

Usage:
    Development:
        uvicorn main:app --reload --host 127.0.0.1 --port 8000

    Production:
        uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1
"""

from fastapi import FastAPI

from api.routes import router

# Application metadata
APP_TITLE = "ContPAQ-Win AI Invoice Service"
APP_DESCRIPTION = """
AI-powered invoice processing service for ContPAQ-Win.

## Features

* **PDF Text Extraction**: Extract text from text-based and scanned PDFs
* **OCR Processing**: Tesseract-based OCR for scanned invoices
* **AI Field Extraction**: LayoutLMv3-based intelligent field extraction
* **Mexican Invoice Support**: Specialized for CFDI/Mexican invoice formats

## Endpoints

* `/health` - Service health check
* `/extract` - Single invoice extraction
* `/extract/batch` - Batch invoice extraction
* `/validate/rfc` - RFC format validation
* `/validate/cfdi` - CFDI compliance validation
"""
APP_VERSION = "0.1.0"

# Create FastAPI application
app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Include API routes
app.include_router(router)


# Root endpoint for basic connectivity check
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint - redirects to docs."""
    return {
        "message": "ContPAQ-Win AI Invoice Service",
        "docs": "/docs",
        "health": "/health",
    }
