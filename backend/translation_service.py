import json
from pathlib import Path
from openai import AsyncOpenAI


class TranslationService:
    """Handles form field translation using OpenAI API."""

    _LANGUAGE_NAMES = {"en": "English", "es": "Spanish"}

    def __init__(self):
        api_key = self._load_api_key()
        if not api_key:
            raise ValueError(
                "OpenAI API key not found. Create backend/api_key.txt with your key."
            )
        self._client = AsyncOpenAI(api_key=api_key)

    def _load_api_key(self) -> str:
        """Load API key from local file."""
        key_file = Path(__file__).parent / "api_key.txt"
        if key_file.exists():
            return key_file.read_text().strip()
        return ""

    async def translate_form_name(self, form_name: str, target_language: str) -> str:
        """
        Translate form name to target language.

        Args:
            form_name: The form name to translate
            target_language: Language code (e.g., 'es' for Spanish)

        Returns:
            Translated form name
        """
        if target_language == "en":
            return form_name

        # get target language
        target_lang_name = self._LANGUAGE_NAMES.get(target_language, target_language)

        # prompt
        prompt = f"""Translate the following form name to {target_lang_name}. 
                    Keep medical terminology accurate and professional. 
                    Return ONLY the translated text, nothing else.

                    Form name: {form_name}"""

        # send prompt to OpenAI and get response
        response = await self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional medical translator. Translate accurately while maintaining medical terminology precision.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        # return first and only response's content
        return response.choices[0].message.content.strip()

    async def translate_responses_to_english(
        self, response_data: dict, source_language: str
    ) -> dict:
        """
        Translate form response data back to English for storage.

        Args:
            response_data: Dictionary of field responses (field_key: value pairs)
            source_language: Language code the responses are in (e.g., 'es')

        Returns:
            Dictionary with translated values
        """
        if source_language == "en":
            return response_data

        # get source language
        source_lang_name = self._LANGUAGE_NAMES.get(source_language, source_language)

        # Extract non-empty text values to translate
        translatable_items = {}
        for key, value in response_data.items():
            if isinstance(value, str) and value.strip():
                translatable_items[key] = value
            elif isinstance(value, list) and value:
                # Handle checkbox arrays
                translatable_items[key] = value

        if not translatable_items:
            return response_data

        # Translate in batch
        prompt = f"""Translate the following patient form responses from {source_lang_name} to English.
                    Maintain the JSON structure exactly. Only translate the text values, not the keys.
                    Keep medical terminology accurate and professional.

                    {json.dumps(translatable_items, ensure_ascii=False)}"""

        response = await self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional medical translator. Translate accurately while maintaining medical terminology precision.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        translated_text = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if translated_text.startswith("```"):
            lines = translated_text.split("\n")
            translated_text = "\n".join(lines[1:-1])

        translated_items = json.loads(translated_text)

        # Merge translated values back into original response data
        translated_response = response_data.copy()
        for key, value in translated_items.items():
            translated_response[key] = value

        return translated_response

    async def translate_form_fields(
        self, fields: list[dict], target_language: str
    ) -> list[dict]:
        """
        Translate form fields to target language.

        Args:
            fields: List of field dictionaries containing translatable text
            target_language: Language code (e.g., 'es' for Spanish)

        Returns:
            List of translated field dictionaries
        """
        if target_language == "en":
            return fields
            # default value
        target_lang_name = self._LANGUAGE_NAMES.get(target_language, target_language)

        translatable_content = self._extract_translatable_content(fields)
        translated_content = await self._translate_batch(
            translatable_content, target_lang_name
        )

        return self._apply_translations(fields, translated_content)

    def _extract_translatable_content(self, fields: list[dict]) -> list[dict]:
        """Extract translatable text from fields."""
        content = []
        for idx, field in enumerate(fields):
            item = {"index": idx}
            if "label" in field:
                item["label"] = field["label"]
            if "placeholder" in field:
                item["placeholder"] = field["placeholder"]
            if "options" in field and field["options"]:
                item["options"] = field["options"]
            content.append(item)
        return content

    async def _translate_batch(
        self, content: list[dict], target_language: str
    ) -> list[dict]:
        """Translate batch of content using OpenAI."""
        prompt = f"""Translate the following form field content to {target_language}. 
                    Maintain the JSON structure exactly. Only translate the text values, not the keys.
                    Keep medical terminology accurate and professional.

                    {json.dumps(content, ensure_ascii=False)}"""

        response = await self._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional medical translator. Translate accurately while maintaining medical terminology precision.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        translated_text = response.choices[0].message.content.strip()

        # Remove markdown code blocks if present
        if translated_text.startswith("```"):
            lines = translated_text.split("\n")
            translated_text = "\n".join(lines[1:-1])

        return json.loads(translated_text)

    def _apply_translations(
        self, original_fields: list[dict], translations: list[dict]
    ) -> list[dict]:
        """Apply translations to original fields."""
        translated_fields = []

        for field in original_fields:
            translated_field = field.copy()

            # Find matching translation by index
            translation = next(
                (t for t in translations if t["index"] == original_fields.index(field)),
                None,
            )

            if translation:
                if "label" in translation:
                    translated_field["label"] = translation["label"]
                if "placeholder" in translation:
                    translated_field["placeholder"] = translation["placeholder"]
                if "options" in translation:
                    translated_field["options"] = translation["options"]

            translated_fields.append(translated_field)

        return translated_fields
