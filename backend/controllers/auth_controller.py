from flask import current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth_service import AuthService


class AuthController:
    """Controller layer for authentication endpoints."""

    @staticmethod
    def register():
        data = request.get_json(silent=True) or {}
        try:
            user = AuthService.register_user(data)
            return current_app.response_success(
                'User registered successfully',
                data={'user': user.to_dict()},
                status_code=201,
            )
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Registration failed', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    def login():
        data = request.get_json(silent=True) or {}
        try:
            result = AuthService.login_user(data)
            return current_app.response_success('Login successful', data=result, status_code=200)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=401)
        except Exception as exc:
            return current_app.response_error('Login failed', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def logout():
        user_id = get_jwt_identity()
        return current_app.response_success('Logout successful', data={'user_id': user_id}, status_code=200)

    @staticmethod
    @jwt_required()
    def profile():
        user_id = get_jwt_identity()
        try:
            user = AuthService.get_profile(user_id)
            return current_app.response_success('User profile fetched successfully', data={'user': user.to_dict()}, status_code=200)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
