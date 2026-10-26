"""
Prediction service — bridges Flask ORM models and the ML modules.
Fetches user data, converts to plain dicts, and calls ML functions.
"""

from models.Expense import Expense
from models.Income import Income
from models.Budget import Budget

from machine_learning.expense_prediction import predict_next_month
from machine_learning.budget_recommendation import recommend_budget
from machine_learning.spending_analysis import analyse_spending
from machine_learning.saving_tips import generate_saving_tips


def _expense_dicts(user_id: int) -> list:
    return [
        {
            'amount':        float(e.amount),
            'expense_date':  e.expense_date,
            'category_name': e.category_name or 'General',
        }
        for e in Expense.query.filter_by(user_id=user_id).all()
        if e.expense_date
    ]


def _income_dicts(user_id: int) -> list:
    return [
        {
            'amount':      float(i.amount),
            'income_date': i.income_date,
            'source':      i.source or 'General',
        }
        for i in Income.query.filter_by(user_id=user_id).all()
        if i.income_date
    ]


def _budget_dicts(user_id: int) -> list:
    return [
        {
            'monthly_budget': float(b.monthly_budget),
            'spent_amount':   float(b.spent_amount),
            'budget_status':  b.budget_status,
            'month':          b.month,
            'year':           b.year,
        }
        for b in Budget.query.filter_by(user_id=user_id).all()
    ]


class PredictionService:
    """Orchestrates all ML predictions for a given user."""

    @staticmethod
    def predict_expense(user_id: int) -> dict:
        return predict_next_month(_expense_dicts(user_id), _income_dicts(user_id))

    @staticmethod
    def budget_recommendation(user_id: int) -> dict:
        return recommend_budget(_expense_dicts(user_id), _income_dicts(user_id))

    @staticmethod
    def spending_analysis(user_id: int) -> dict:
        return analyse_spending(_expense_dicts(user_id), _income_dicts(user_id))

    @staticmethod
    def saving_tips(user_id: int) -> dict:
        return generate_saving_tips(
            _expense_dicts(user_id),
            _income_dicts(user_id),
            _budget_dicts(user_id),
        )
