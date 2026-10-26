from flask import request
from utils.validators import validate_required_fields


def validate_json_body(required_fields=None):
    """Simple request validation decorator placeholder."""
    def decorator(fn):
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return {'success': False, 'message': 'Request body must be JSON'}, 400
            data = request.get_json(silent=True) or {}
            if required_fields:
                missing = validate_required_fields(data, required_fields)
                if missing:
                    return {'success': False, 'message': 'Missing required fields', 'errors': missing}, 400
            return fn(*args, **kwargs)

        wrapper.__name__ = fn.__name__
        return wrapper

    return decorator
