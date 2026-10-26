from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.dashboard_service import DashboardService


class DashboardController:
    """Controller for dashboard endpoints."""

    @staticmethod
    @jwt_required()
    def summary():
        user_id = get_jwt_identity()
        try:
            summary = DashboardService.get_summary(user_id)
            return current_app.response_success('Dashboard summary fetched', data=summary, status_code=200)
        except Exception as exc:
            return current_app.response_error('Unable to load dashboard summary', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def recent_transactions():
        user_id = get_jwt_identity()
        try:
            transactions = DashboardService.get_recent_transactions(user_id)
            return current_app.response_success('Recent transactions fetched', data=transactions, status_code=200)
        except Exception as exc:
            return current_app.response_error('Unable to load recent transactions', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def chart_data():
        user_id = get_jwt_identity()
        try:
            chart_data = DashboardService.get_chart_data(user_id)
            return current_app.response_success('Dashboard chart data fetched', data=chart_data, status_code=200)
        except Exception as exc:
            return current_app.response_error('Unable to load chart data', status_code=500, errors={'detail': str(exc)})
