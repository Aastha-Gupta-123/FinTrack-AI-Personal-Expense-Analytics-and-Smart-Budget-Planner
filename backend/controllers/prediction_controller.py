from flask import current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.prediction_service import PredictionService


class PredictionController:
    """Controller for ML prediction endpoints."""

    @staticmethod
    @jwt_required()
    def predict_expense():
        user_id = int(get_jwt_identity())
        try:
            data = PredictionService.predict_expense(user_id)
            if 'error' in data:
                return current_app.response_error(data['error'], status_code=422)
            return current_app.response_success('Expense prediction ready', data=data)
        except Exception as exc:
            return current_app.response_error('Prediction failed', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def budget_recommendation():
        user_id = int(get_jwt_identity())
        try:
            data = PredictionService.budget_recommendation(user_id)
            if 'error' in data:
                return current_app.response_error(data['error'], status_code=422)
            return current_app.response_success('Budget recommendation ready', data=data)
        except Exception as exc:
            return current_app.response_error('Recommendation failed', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def spending_analysis():
        user_id = int(get_jwt_identity())
        try:
            data = PredictionService.spending_analysis(user_id)
            if 'error' in data:
                return current_app.response_error(data['error'], status_code=422)
            return current_app.response_success('Spending analysis ready', data=data)
        except Exception as exc:
            return current_app.response_error('Analysis failed', status_code=500, errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def saving_tips():
        user_id = int(get_jwt_identity())
        try:
            data = PredictionService.saving_tips(user_id)
            return current_app.response_success('Saving tips ready', data=data)
        except Exception as exc:
            return current_app.response_error('Tips generation failed', status_code=500, errors={'detail': str(exc)})
