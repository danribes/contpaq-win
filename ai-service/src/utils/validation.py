"""
T020 - Validation Utilities

RFC and CFDI validation functions for Mexican invoices.

RFC (Registro Federal de Contribuyentes) format:
- Persona Física (individual): 13 characters
  - 4 letters from name (paternal, maternal, first name)
  - 6 digits for birthdate (YYMMDD)
  - 3 alphanumeric homoclave
- Persona Moral (company): 12 characters
  - 3 letters from company name
  - 6 digits for constitution date (YYMMDD)
  - 3 alphanumeric homoclave
"""

import re
from typing import TypedDict, Optional, List


class RfcValidationResult(TypedDict):
    """Result of RFC validation."""

    valid: bool
    rfc_type: Optional[str]
    normalized_rfc: Optional[str]
    error: Optional[str]


# RFC patterns
# Persona Física: 4 letters + 6 digits (date) + 3 alphanumeric
RFC_PERSONA_FISICA_PATTERN = re.compile(r"^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$")

# Persona Moral: 3 letters + 6 digits (date) + 3 alphanumeric
RFC_PERSONA_MORAL_PATTERN = re.compile(r"^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$")


def _validate_date_portion(date_str: str) -> tuple[bool, str]:
    """
    Validate the 6-digit date portion (YYMMDD) of an RFC.

    Args:
        date_str: 6-character date string (YYMMDD)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(date_str) != 6:
        return False, "La porción de fecha debe tener 6 dígitos"

    try:
        year = int(date_str[0:2])
        month = int(date_str[2:4])
        day = int(date_str[4:6])

        # Validate month (01-12)
        if month < 1 or month > 12:
            return False, "El mes de la fecha debe estar entre 01 y 12"

        # Validate day based on month
        days_in_month = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        max_days = days_in_month[month - 1]

        if day < 1 or day > max_days:
            return False, f"El día de la fecha debe estar entre 01 y {max_days:02d}"

        return True, ""

    except ValueError:
        return False, "La porción de fecha contiene caracteres inválidos"


def validate_rfc(rfc: str) -> RfcValidationResult:
    """
    Validate a Mexican RFC (Registro Federal de Contribuyentes).

    Args:
        rfc: RFC string to validate

    Returns:
        RfcValidationResult with validation status and details

    Examples:
        >>> validate_rfc("XAXX010101000")
        {'valid': True, 'rfc_type': 'persona_fisica', 'normalized_rfc': 'XAXX010101000', 'error': None}

        >>> validate_rfc("XAX010101000")
        {'valid': True, 'rfc_type': 'persona_moral', 'normalized_rfc': 'XAX010101000', 'error': None}

        >>> validate_rfc("INVALID")
        {'valid': False, 'rfc_type': None, 'normalized_rfc': None, 'error': '...'}
    """
    # Handle None or empty
    if not rfc:
        return RfcValidationResult(
            valid=False,
            rfc_type=None,
            normalized_rfc=None,
            error="El RFC no puede estar vacío",
        )

    # Normalize: trim whitespace and convert to uppercase
    normalized = rfc.strip().upper()

    # Check for internal spaces or special characters (except Ñ and &)
    if " " in normalized:
        return RfcValidationResult(
            valid=False,
            rfc_type=None,
            normalized_rfc=None,
            error="El RFC no debe contener espacios",
        )

    # Check length
    if len(normalized) < 12:
        return RfcValidationResult(
            valid=False,
            rfc_type=None,
            normalized_rfc=None,
            error=f"El RFC tiene longitud inválida ({len(normalized)} caracteres). Debe tener 12 o 13 caracteres",
        )

    if len(normalized) > 13:
        return RfcValidationResult(
            valid=False,
            rfc_type=None,
            normalized_rfc=None,
            error=f"El RFC tiene longitud inválida ({len(normalized)} caracteres). Debe tener 12 o 13 caracteres",
        )

    # Determine type and validate pattern
    if len(normalized) == 13:
        # Persona Física
        if not RFC_PERSONA_FISICA_PATTERN.match(normalized):
            return RfcValidationResult(
                valid=False,
                rfc_type=None,
                normalized_rfc=None,
                error="El formato del RFC de persona física es inválido. Debe ser: 4 letras + 6 dígitos de fecha + 3 caracteres alfanuméricos",
            )

        # Validate date portion (positions 4-9)
        date_portion = normalized[4:10]
        date_valid, date_error = _validate_date_portion(date_portion)
        if not date_valid:
            return RfcValidationResult(
                valid=False,
                rfc_type=None,
                normalized_rfc=None,
                error=f"La fecha en el RFC es inválida: {date_error}",
            )

        return RfcValidationResult(
            valid=True,
            rfc_type="persona_fisica",
            normalized_rfc=normalized,
            error=None,
        )

    else:
        # Persona Moral (12 chars)
        if not RFC_PERSONA_MORAL_PATTERN.match(normalized):
            return RfcValidationResult(
                valid=False,
                rfc_type=None,
                normalized_rfc=None,
                error="El formato del RFC de persona moral es inválido. Debe ser: 3 letras + 6 dígitos de fecha + 3 caracteres alfanuméricos",
            )

        # Validate date portion (positions 3-8)
        date_portion = normalized[3:9]
        date_valid, date_error = _validate_date_portion(date_portion)
        if not date_valid:
            return RfcValidationResult(
                valid=False,
                rfc_type=None,
                normalized_rfc=None,
                error=f"La fecha en el RFC es inválida: {date_error}",
            )

        return RfcValidationResult(
            valid=True,
            rfc_type="persona_moral",
            normalized_rfc=normalized,
            error=None,
        )


# =============================================================================
# CFDI Validation
# =============================================================================

# Default IVA rate in Mexico
DEFAULT_IVA_RATE = 0.16

# Tolerance for rounding differences in amounts
AMOUNT_TOLERANCE = 0.02  # Allow ±0.02 for rounding


class CfdiValidationResult(TypedDict):
    """Result of CFDI validation."""

    valid: bool
    errors: List[str]
    warnings: List[str]


def validate_cfdi(
    vendor_rfc: str,
    invoice_number: str,
    invoice_date: str,
    subtotal: float,
    iva_amount: float,
    total: float,
    iva_rate: float = DEFAULT_IVA_RATE,
) -> CfdiValidationResult:
    """
    Validate a Mexican CFDI (Comprobante Fiscal Digital por Internet).

    Validates:
    - Required fields are present
    - IVA calculation (subtotal * iva_rate = iva_amount)
    - Total calculation (subtotal + iva_amount = total)
    - Non-negative amounts

    Args:
        vendor_rfc: Vendor's RFC
        invoice_number: Invoice number/folio
        invoice_date: Invoice date
        subtotal: Subtotal amount before IVA
        iva_amount: IVA (VAT) amount
        total: Total amount
        iva_rate: IVA rate (default 0.16 = 16%)

    Returns:
        CfdiValidationResult with validation status, errors, and warnings

    Examples:
        >>> validate_cfdi("XAXX010101000", "A-001", "2024-01-15", 1000.00, 160.00, 1160.00)
        {'valid': True, 'errors': [], 'warnings': []}
    """
    errors: List[str] = []
    warnings: List[str] = []

    # ==========================================================================
    # Required fields validation
    # ==========================================================================

    if not vendor_rfc or not vendor_rfc.strip():
        errors.append("El RFC del proveedor es requerido")

    if not invoice_number or not invoice_number.strip():
        errors.append("El número de factura es requerido")

    if not invoice_date or not invoice_date.strip():
        errors.append("La fecha de la factura es requerida")

    # ==========================================================================
    # Amount validation
    # ==========================================================================

    # Check for negative values
    if subtotal < 0:
        errors.append("El subtotal no puede ser negativo")

    if iva_amount < 0:
        errors.append("El IVA no puede ser negativo")

    if total < 0:
        errors.append("El total no puede ser negativo")

    # Skip calculation validation if we have negative values
    if subtotal < 0 or iva_amount < 0 or total < 0:
        return CfdiValidationResult(
            valid=False,
            errors=errors,
            warnings=warnings,
        )

    # ==========================================================================
    # IVA calculation validation
    # ==========================================================================

    expected_iva = subtotal * iva_rate
    iva_difference = abs(iva_amount - expected_iva)

    if iva_difference > AMOUNT_TOLERANCE:
        # Check if it's a different rate scenario
        if subtotal > 0:
            actual_rate = iva_amount / subtotal
            expected_rate_str = f"{iva_rate * 100:.0f}%"

            # If IVA is 0, check if subtotal is also 0 or it's exempt
            if iva_amount == 0 and iva_rate > 0 and subtotal > 0:
                warnings.append(
                    f"El IVA es $0.00 pero el subtotal es ${subtotal:,.2f}. "
                    "Si la factura está exenta de IVA, esto es correcto."
                )
            else:
                errors.append(
                    f"El IVA calculado (${expected_iva:,.2f}) no coincide con el IVA proporcionado "
                    f"(${iva_amount:,.2f}). Diferencia: ${iva_difference:,.2f}. "
                    f"Tasa IVA esperada: {expected_rate_str}"
                )

    # ==========================================================================
    # Total calculation validation
    # ==========================================================================

    expected_total = subtotal + iva_amount
    total_difference = abs(total - expected_total)

    if total_difference > AMOUNT_TOLERANCE:
        errors.append(
            f"El total calculado (${expected_total:,.2f}) no coincide con el total proporcionado "
            f"(${total:,.2f}). Diferencia: ${total_difference:,.2f}"
        )

    # ==========================================================================
    # Warnings for unusual values
    # ==========================================================================

    # Very high IVA rate warning
    if iva_rate > 0.16 and subtotal > 0:
        actual_rate = iva_amount / subtotal if subtotal > 0 else 0
        if actual_rate > 0.17:  # More than 17%
            warnings.append(
                f"La tasa de IVA ({actual_rate * 100:.1f}%) es mayor que la tasa estándar (16%)"
            )

    # ==========================================================================
    # Return result
    # ==========================================================================

    return CfdiValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )
