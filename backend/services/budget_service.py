from datetime import datetime
from app import db
from models.Budget import Budget
from models.Expense import Expense
from utils.validators import validate_required_fields


def _compute_status(usage_pct):
    if usage_pct <= 70:
        return 'Safe'
    if usage_pct <= 90:
        return 'Warning'
    return 'Overspent'


def _sync_spent(budget):
    """Recalculate spent_amount from actual expenses for the budget month/year."""
    from sqlalchemy import extract
    spent = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == budget.user_id,
        extract('month', Expense.expense_date) == budget.month,
        extract('year', Expense.expense_date) == budget.year,
    ).scalar() or 0.0

    budget.spent_amount = round(float(spent), 2)
    budget.remaining_amount = round(budget.monthly_budget - budget.spent_amount, 2)
    usage_pct = (budget.spent_amount / budget.monthly_budget * 100) if budget.monthly_budget else 0
    budget.budget_status = _compute_status(usage_pct)
    budget.updated_at = datetime.utcnow()


class BudgetService:
    """Business logic for budget CRUD and calculations."""

    @staticmethod
    def create_budget(user_id, data):
        missing = validate_required_fields(data, ['month', 'year', 'monthly_budget'])
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        monthly_budget = float(data['monthly_budget'])
        if monthly_budget <= 0:
            raise ValueError('Budget must be greater than zero')

        month = int(data['month'])
        year = int(data['year'])
        if not (1 <= month <= 12):
            raise ValueError('Month must be between 1 and 12')

        existing = Budget.query.filter_by(user_id=user_id, month=month, year=year).first()
        if existing:
            raise ValueError('A budget for this month already exists')

        budget = Budget(user_id=user_id, month=month, year=year, monthly_budget=monthly_budget)
        db.session.add(budget)
        db.session.flush()   # get id before sync
        _sync_spent(budget)
        db.session.commit()
        return budget.to_dict()

    @staticmethod
    def list_budgets(user_id):
        budgets = Budget.query.filter_by(user_id=user_id).order_by(Budget.year.desc(), Budget.month.desc()).all()
        # Sync each budget with latest expenses
        for b in budgets:
            _sync_spent(b)
        db.session.commit()
        return [b.to_dict() for b in budgets]

    @staticmethod
    def get_budget(user_id, budget_id):
        budget = Budget.query.filter_by(user_id=user_id, id=budget_id).first()
        if not budget:
            raise ValueError('Budget not found')
        _sync_spent(budget)
        db.session.commit()
        return budget.to_dict()

    @staticmethod
    def update_budget(user_id, budget_id, data):
        budget = Budget.query.filter_by(user_id=user_id, id=budget_id).first()
        if not budget:
            raise ValueError('Budget not found')

        if 'monthly_budget' in data:
            monthly_budget = float(data['monthly_budget'])
            if monthly_budget <= 0:
                raise ValueError('Budget must be greater than zero')
            budget.monthly_budget = monthly_budget

        if 'month' in data:
            month = int(data['month'])
            if not (1 <= month <= 12):
                raise ValueError('Month must be between 1 and 12')
            # Check uniqueness if month/year changed
            year = int(data.get('year', budget.year))
            conflict = Budget.query.filter(
                Budget.user_id == user_id,
                Budget.month == month,
                Budget.year == year,
                Budget.id != budget_id,
            ).first()
            if conflict:
                raise ValueError('A budget for this month already exists')
            budget.month = month
            budget.year = year
        elif 'year' in data:
            budget.year = int(data['year'])

        _sync_spent(budget)
        db.session.commit()
        return budget.to_dict()

    @staticmethod
    def delete_budget(user_id, budget_id):
        budget = Budget.query.filter_by(user_id=user_id, id=budget_id).first()
        if not budget:
            raise ValueError('Budget not found')
        db.session.delete(budget)
        db.session.commit()

    @staticmethod
    def get_savings_suggestion(budget_dict):
        """Return a savings suggestion string based on budget status."""
        remaining = budget_dict['remaining_amount']
        usage = budget_dict['usage_percentage']
        if budget_dict['budget_status'] == 'Overspent':
            overspent = abs(remaining)
            return f"You have overspent by ${overspent:.2f}. Consider cutting discretionary expenses next month."
        if usage >= 71:
            return f"You've used {usage:.0f}% of your budget. Slow down spending to stay on track."
        if remaining > 0:
            save_target = round(remaining * 0.5, 2)
            return f"Great job! You have ${remaining:.2f} remaining. Consider saving ${save_target:.2f} this month."
        return "Set a budget to start tracking your savings."
