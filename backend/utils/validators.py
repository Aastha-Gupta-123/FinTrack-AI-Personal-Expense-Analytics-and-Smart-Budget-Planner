def validate_required_fields(data: dict, required_fields: list) -> list:
    """
    Return a list of fields that are missing or blank in the given data dict.
    A field is considered missing if it does not exist in data, or its value
    is None, or after stripping whitespace it is an empty string.
    """
    if not isinstance(data, dict):
        return required_fields  # everything is missing if data isn't a dict

    missing = []
    for field in required_fields:
        value = data.get(field)
        if value is None:
            missing.append(field)
        elif isinstance(value, str) and not value.strip():
            missing.append(field)
    return missing
