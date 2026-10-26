from flask import jsonify, request
import logging

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """Register global error handlers and request/response logging for the Flask app."""

    @app.before_request
    def log_request():
        # Skip logging for static files and health check
        if not request.path.startswith('/uploads'):
            logger.info('%s %s from %s', request.method, request.path, request.remote_addr)

    @app.after_request
    def add_security_headers(response):
        """Add security headers to every response."""
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    @app.errorhandler(400)
    def bad_request(e):
        logger.warning('Bad request: %s %s — %s', request.method, request.path, str(e))
        return jsonify({'success': False, 'message': 'Bad request', 'detail': str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'success': False, 'message': 'Unauthorized — please log in'}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'success': False, 'message': 'Forbidden — insufficient permissions'}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'success': False, 'message': 'Method not allowed'}), 405

    @app.errorhandler(413)
    def request_too_large(e):
        return jsonify({'success': False, 'message': 'File is too large. Maximum size is 16 MB.'}), 413

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({'success': False, 'message': 'Unprocessable entity — check your input'}), 422

    @app.errorhandler(429)
    def too_many_requests(e):
        return jsonify({'success': False, 'message': 'Too many requests — please slow down'}), 429

    @app.errorhandler(500)
    def server_error(e):
        logger.error('Internal server error on %s %s: %s', request.method, request.path, str(e), exc_info=True)
        return jsonify({'success': False, 'message': 'An internal server error occurred. Please try again.'}), 500

    @app.errorhandler(Exception)
    def unhandled_exception(e):
        """Catch-all for any unhandled exception."""
        logger.error('Unhandled exception on %s %s: %s', request.method, request.path, str(e), exc_info=True)
        return jsonify({'success': False, 'message': 'An unexpected error occurred. Please try again.'}), 500
