"""
CategoryController — HTTP handler for /api/categories routes.
"""
from flask import current_app, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.category_service import CategoryService


class CategoryController:
    """Controller for category CRUD endpoints."""

    @staticmethod
    @jwt_required()
    def list_categories():
        user_id = int(get_jwt_identity())
        try:
            cats = CategoryService.list_categories(user_id)
            return current_app.response_success('Categories fetched', data={'categories': cats})
        except Exception as exc:
            return current_app.response_error('Unable to fetch categories', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def create_category():
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        try:
            cat = CategoryService.create_category(user_id, data)
            return current_app.response_success('Category created', data={'category': cat}, status_code=201)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Unable to create category', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def delete_category(category_id):
        user_id = int(get_jwt_identity())
        try:
            CategoryService.delete_category(user_id, category_id)
            return current_app.response_success('Category deleted', data={'category_id': category_id})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
        except Exception as exc:
            return current_app.response_error('Unable to delete category', status_code=500, errors={'detail': str(exc)})
