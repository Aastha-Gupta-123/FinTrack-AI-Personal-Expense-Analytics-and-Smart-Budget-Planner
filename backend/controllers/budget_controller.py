from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.budget_service import BudgetService


class BudgetController:
    """Controller for budget CRUD endpoints."""

    @staticmethod
    @jwt_required()
    def list_budgets():
        user_id = int(get_jwt_identity())
        try:
            budgets = BudgetService.list_budgets(user_id)
            return current_app.response_success('Budgets fetched successfully', data={'budgets': budgets})
        except Exception as exc:
            return current_app.response_error('Unable to fetch budgets', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def create_budget():
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        try:
            budget = BudgetService.create_budget(user_id, data)
            suggestion = BudgetService.get_savings_suggestion(budget)
            return current_app.response_success('Budget created successfully', data={'budget': budget, 'suggestion': suggestion}, status_code=201)
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Unable to create budget', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def get_budget(budget_id):
        user_id = int(get_jwt_identity())
        try:
            budget = BudgetService.get_budget(user_id, budget_id)
            suggestion = BudgetService.get_savings_suggestion(budget)
            return current_app.response_success('Budget fetched successfully', data={'budget': budget, 'suggestion': suggestion})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
        except Exception as exc:
            return current_app.response_error('Unable to fetch budget', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def update_budget(budget_id):
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        try:
            budget = BudgetService.update_budget(user_id, budget_id, data)
            suggestion = BudgetService.get_savings_suggestion(budget)
            return current_app.response_success('Budget updated successfully', data={'budget': budget, 'suggestion': suggestion})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=400)
        except Exception as exc:
            return current_app.response_error('Unable to update budget', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def delete_budget(budget_id):
        user_id = int(get_jwt_identity())
        try:
            BudgetService.delete_budget(user_id, budget_id)
            return current_app.response_success('Budget deleted successfully', data={'budget_id': budget_id})
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
        except Exception as exc:
            return current_app.response_error('Unable to delete budget', status_code=500, errors={'detail': str(exc)})
