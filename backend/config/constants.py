"""
Shared constants for the application.
Centralizes configuration values to avoid duplication and make maintenance easier.
"""

# Supported languages mapping: code -> name
SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
}

# Languages to pre-cache when forms are created
# Add or remove language codes here to control which translations are pre-cached
PRE_CACHE_LANGUAGES = ["es"]
