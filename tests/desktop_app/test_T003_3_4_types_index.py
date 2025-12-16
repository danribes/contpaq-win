"""
Tests for T003.3.4: Create desktop-app/src/renderer/types/index.ts

Tests verify that the TypeScript interfaces file exists and contains
all required type definitions for the application data models.
"""

import os

import pytest


# Path to the types/index.ts file
TYPES_INDEX_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "desktop-app",
    "src",
    "renderer",
    "types",
    "index.ts",
)


class TestTypesIndex:
    """Test suite for desktop-app/src/renderer/types/index.ts."""

    def test_types_index_exists(self):
        """Test that index.ts exists in src/renderer/types directory."""
        assert os.path.isfile(TYPES_INDEX_PATH), (
            f"types/index.ts not found at {TYPES_INDEX_PATH}"
        )

    def test_types_index_is_not_empty(self):
        """Test that types/index.ts has content."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        assert len(content.strip()) > 0, "types/index.ts must not be empty"

    def test_types_has_invoice_state(self):
        """Test that types defines InvoiceState type."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_invoice_state = (
            "InvoiceState" in content and
            ("UPLOADED" in content or "'UPLOADED'" in content or '"UPLOADED"' in content)
        )
        assert has_invoice_state, (
            "types/index.ts must define InvoiceState type with UPLOADED state"
        )

    def test_types_has_source_type(self):
        """Test that types defines SourceType type."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_source_type = (
            "SourceType" in content and
            "text_based" in content
        )
        assert has_source_type, (
            "types/index.ts must define SourceType type"
        )

    def test_types_has_bounding_box_interface(self):
        """Test that types defines BoundingBox interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_bbox = (
            "BoundingBox" in content and
            "width" in content and
            "height" in content
        )
        assert has_bbox, (
            "types/index.ts must define BoundingBox interface"
        )

    def test_types_has_extraction_field_interface(self):
        """Test that types defines ExtractionField interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_extraction = (
            "ExtractionField" in content and
            "confidence" in content
        )
        assert has_extraction, (
            "types/index.ts must define ExtractionField interface"
        )

    def test_types_has_line_item_interface(self):
        """Test that types defines LineItem interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_line_item = (
            "LineItem" in content and
            "quantity" in content and
            "unitPrice" in content
        )
        assert has_line_item, (
            "types/index.ts must define LineItem interface"
        )

    def test_types_has_vendor_interface(self):
        """Test that types defines Vendor interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_vendor = (
            "Vendor" in content and
            "rfc" in content and
            "businessName" in content
        )
        assert has_vendor, (
            "types/index.ts must define Vendor interface with rfc and businessName"
        )

    def test_types_has_invoice_interface(self):
        """Test that types defines Invoice interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_invoice = (
            "interface Invoice" in content and
            "invoiceNumber" in content and
            "subtotal" in content and
            "ivaAmount" in content
        )
        assert has_invoice, (
            "types/index.ts must define Invoice interface"
        )

    def test_types_has_contpaqi_entry_interface(self):
        """Test that types defines ContPAQiEntry interface."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_entry = (
            "ContPAQiEntry" in content and
            "folioNumber" in content
        )
        assert has_entry, (
            "types/index.ts must define ContPAQiEntry interface"
        )

    def test_types_has_posting_status(self):
        """Test that types defines PostingStatus type."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_posting = (
            "PostingStatus" in content and
            "pending" in content and
            "success" in content and
            "failed" in content
        )
        assert has_posting, (
            "types/index.ts must define PostingStatus type"
        )

    def test_types_has_service_status(self):
        """Test that types defines ServiceStatus for health monitoring."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_service_status = (
            "ServiceStatus" in content or
            "ServiceHealth" in content
        )
        assert has_service_status, (
            "types/index.ts must define ServiceStatus or ServiceHealth type"
        )

    def test_types_has_electron_api_interface(self):
        """Test that types defines ElectronAPI interface for preload."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_electron_api = (
            "ElectronAPI" in content and
            "invoke" in content
        )
        assert has_electron_api, (
            "types/index.ts must define ElectronAPI interface"
        )

    def test_types_exports_all_interfaces(self):
        """Test that types exports its definitions."""
        with open(TYPES_INDEX_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        has_export = "export" in content
        assert has_export, (
            "types/index.ts must export its type definitions"
        )
