from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.report_service import ReportService


class ReportController:
    """Controller for report and analytics endpoints."""

    @staticmethod
    @jwt_required()
    def daily():
        user_id = int(get_jwt_identity())
        report_date = request.args.get('date')
        try:
            data = ReportService.daily_report(user_id, report_date)
            return current_app.response_success('Daily report fetched', data=data)
        except Exception as exc:
            return current_app.response_error('Failed to generate daily report', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def weekly():
        user_id = int(get_jwt_identity())
        ref_date = request.args.get('date')
        try:
            data = ReportService.weekly_report(user_id, ref_date)
            return current_app.response_success('Weekly report fetched', data=data)
        except Exception as exc:
            return current_app.response_error('Failed to generate weekly report', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def monthly():
        user_id = int(get_jwt_identity())
        month = request.args.get('month')
        year = request.args.get('year')
        try:
            data = ReportService.monthly_report(user_id, month, year)
            return current_app.response_success('Monthly report fetched', data=data)
        except Exception as exc:
            return current_app.response_error('Failed to generate monthly report', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def yearly():
        user_id = int(get_jwt_identity())
        year = request.args.get('year')
        try:
            data = ReportService.yearly_report(user_id, year)
            return current_app.response_success('Yearly report fetched', data=data)
        except Exception as exc:
            return current_app.response_error('Failed to generate yearly report', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def analytics():
        user_id = int(get_jwt_identity())
        month = request.args.get('month')
        year = request.args.get('year')
        try:
            data = ReportService.analytics(user_id, month, year)
            return current_app.response_success('Analytics fetched', data=data)
        except Exception as exc:
            return current_app.response_error('Failed to generate analytics', status_code=500, errors={'detail': str(exc)})
