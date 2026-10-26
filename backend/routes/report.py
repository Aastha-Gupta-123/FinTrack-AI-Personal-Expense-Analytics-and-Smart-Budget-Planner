from flask import Blueprint
from controllers.report_controller import ReportController

bp = Blueprint('report', __name__, url_prefix='/api/reports')

bp.route('/daily',   methods=['GET'])(ReportController.daily)
bp.route('/weekly',  methods=['GET'])(ReportController.weekly)
bp.route('/monthly', methods=['GET'])(ReportController.monthly)
bp.route('/yearly',  methods=['GET'])(ReportController.yearly)
bp.route('/analytics', methods=['GET'])(ReportController.analytics)
