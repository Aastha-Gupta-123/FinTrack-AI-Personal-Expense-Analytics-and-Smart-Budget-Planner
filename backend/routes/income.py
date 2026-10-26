from flask import Blueprint
from controllers.income_controller import IncomeController

bp = Blueprint('income', __name__, url_prefix='/api/income')

bp.add_url_rule('', view_func=IncomeController.list_incomes, methods=['GET'])
bp.add_url_rule('', view_func=IncomeController.create_income, methods=['POST'])
bp.add_url_rule('/<int:income_id>', view_func=IncomeController.get_income, methods=['GET'])
bp.add_url_rule('/<int:income_id>', view_func=IncomeController.update_income, methods=['PUT'])
bp.add_url_rule('/<int:income_id>', view_func=IncomeController.delete_income, methods=['DELETE'])
