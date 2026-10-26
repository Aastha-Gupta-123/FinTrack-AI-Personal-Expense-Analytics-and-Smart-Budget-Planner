from flask import Blueprint
from controllers.budget_controller import BudgetController

bp = Blueprint('budget', __name__, url_prefix='/api/budget')

bp.route('', methods=['GET'])(BudgetController.list_budgets)
bp.route('', methods=['POST'])(BudgetController.create_budget)
bp.route('/<int:budget_id>', methods=['GET'])(BudgetController.get_budget)
bp.route('/<int:budget_id>', methods=['PUT'])(BudgetController.update_budget)
bp.route('/<int:budget_id>', methods=['DELETE'])(BudgetController.delete_budget)
