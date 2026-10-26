from flask import Blueprint
from controllers.dashboard_controller import DashboardController

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

bp.add_url_rule('/summary', view_func=DashboardController.summary, methods=['GET'])
bp.add_url_rule('/recent-transactions', view_func=DashboardController.recent_transactions, methods=['GET'])
bp.add_url_rule('/chart-data', view_func=DashboardController.chart_data, methods=['GET'])
