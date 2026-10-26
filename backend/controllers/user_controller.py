from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.user_service import UserService


class UserController:

    @staticmethod
    @jwt_required()
    def get_profile():
        user_id = get_jwt_identity()
        try:
            profile = UserService.get_profile(user_id)
            return current_app.response_success('Profile fetched', data={'user': profile})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
        except Exception as exc:
            return current_app.response_error('Failed to fetch profile', status_code=500,
                                               errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def update_profile():
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        try:
            user = UserService.update_profile(user_id, data)
            return current_app.response_success('Profile updated', data={'user': user})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Failed to update profile', status_code=500,
                                               errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def upload_picture():
        user_id = get_jwt_identity()
        file = request.files.get('profile_image')
        try:
            user = UserService.upload_profile_picture(
                user_id, file, current_app.config['UPLOAD_FOLDER']
            )
            return current_app.response_success('Profile picture updated', data={'user': user})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Upload failed', status_code=500,
                                               errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def delete_picture():
        user_id = get_jwt_identity()
        try:
            user = UserService.delete_profile_picture(user_id, current_app.config['UPLOAD_FOLDER'])
            return current_app.response_success('Profile picture removed', data={'user': user})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)

    @staticmethod
    @jwt_required()
    def change_password():
        user_id = get_jwt_identity()
        data = request.get_json(silent=True) or {}
        try:
            UserService.change_password(user_id, data)
            return current_app.response_success('Password changed successfully')
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Failed to change password', status_code=500,
                                               errors={'detail': str(exc)})
