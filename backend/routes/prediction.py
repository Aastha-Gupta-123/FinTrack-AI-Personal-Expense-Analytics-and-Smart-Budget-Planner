from flask import Blueprint
from controllers.prediction_controller import PredictionController

bp = Blueprint('prediction', __name__, url_prefix='/api/ml')

bp.route('/predict-expense',      methods=['GET'])(PredictionController.predict_expense)
bp.route('/budget-recommendation', methods=['GET'])(PredictionController.budget_recommendation)
bp.route('/spending-analysis',    methods=['GET'])(PredictionController.spending_analysis)
bp.route('/saving-tips',          methods=['GET'])(PredictionController.saving_tips)
