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
from typing import TypedDict, Optional


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
