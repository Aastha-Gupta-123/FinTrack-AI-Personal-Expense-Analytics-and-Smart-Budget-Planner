from flask import jsonify


def register_response_helpers(app):
    """Attach response helper methods to the Flask app."""
    def success(message='Success', data=None, status_code=200):
        payload = {'success': True, 'message': message}
        if data is not None:
            payload['data'] = data
        return jsonify(payload), status_code

    def error(message='Error', status_code=400, errors=None):
        payload = {'success': False, 'message': message}
        if errors is not None:
            payload['errors'] = errors
        return jsonify(payload), status_code

    app.response_success = success
    app.response_error = error
