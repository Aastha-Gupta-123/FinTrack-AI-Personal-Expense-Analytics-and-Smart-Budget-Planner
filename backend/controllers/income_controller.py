from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.income_service import IncomeService


class IncomeController:
    """Controller for income CRUD endpoints."""

    @staticmethod
    @jwt_required()
    def list_incomes():
        user_id = int(get_jwt_identity())
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 10))
            search = request.args.get('search', '')
            source = request.args.get('source', '')
            date_filter = request.args.get('date', '')
            sort = request.args.get('sort', 'income_date')
            incomes, total = IncomeService.list_incomes(user_id, page, per_page, search, source, date_filter, sort)
            return current_app.response_success('Incomes fetched successfully', data={'incomes': incomes, 'total': total, 'page': page, 'per_page': per_page}, status_code=200)
        except Exception as exc:
            return current_app.response_error('Unable to fetch incomes', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def create_income():
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        try:
            income = IncomeService.create_income(user_id, data)
            return current_app.response_success('Income created successfully', data={'income': income}, status_code=201)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)

    @staticmethod
    @jwt_required()
    def get_income(income_id):
        user_id = int(get_jwt_identity())
        try:
            income = IncomeService.get_income(user_id, income_id)
            return current_app.response_success('Income fetched successfully', data={'income': income}, status_code=200)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)

    @staticmethod
    @jwt_required()
    def update_income(income_id):
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        try:
            income = IncomeService.update_income(user_id, income_id, data)
            return current_app.response_success('Income updated successfully', data={'income': income}, status_code=200)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)

    @staticmethod
    @jwt_required()
    def delete_income(income_id):
        user_id = int(get_jwt_identity())
        try:
            IncomeService.delete_income(user_id, income_id)
            return current_app.response_success('Income deleted successfully', data={'income_id': income_id}, status_code=200)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
