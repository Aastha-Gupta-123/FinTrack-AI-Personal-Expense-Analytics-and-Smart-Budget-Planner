from flask import Blueprint
from controllers.expense_controller import ExpenseController

bp = Blueprint('expense', __name__, url_prefix='/api/expenses')

bp.add_url_rule('', view_func=ExpenseController.list_expenses, methods=['GET'])
bp.add_url_rule('', view_func=ExpenseController.create_expense, methods=['POST'])
bp.add_url_rule('/<int:expense_id>', view_func=ExpenseController.get_expense, methods=['GET'])
bp.add_url_rule('/<int:expense_id>', view_func=ExpenseController.update_expense, methods=['PUT'])
bp.add_url_rule('/<int:expense_id>', view_func=ExpenseController.delete_expense, methods=['DELETE'])
