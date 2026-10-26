"""
DashboardService — optimised aggregation queries for dashboard KPIs and charts.
All totals use SQL SUM() to avoid loading entire tables into memory.
"""
from collections import defaultdict
from datetime import datetime
from sqlalchemy import func, extract
from app import db
from models.Expense import Expense
from models.Income import Income
from models.User import User
from models.Budget import Budget


MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


class DashboardService:
    """Service for dashboard data aggregation."""

    @staticmethod
    def get_summary(user_id: int) -> dict:
        user_id = int(user_id)  # JWT identity may arrive as str
        # ── Aggregate totals in single SQL queries ────────────────────────────
        total_income   = db.session.query(func.sum(Income.amount)).filter_by(user_id=user_id).scalar() or 0.0
        total_expenses = db.session.query(func.sum(Expense.amount)).filter_by(user_id=user_id).scalar() or 0.0
        income_count   = db.session.query(func.count(Income.id)).filter_by(user_id=user_id).scalar() or 0
        expense_count  = db.session.query(func.count(Expense.id)).filter_by(user_id=user_id).scalar() or 0
        total_savings  = float(total_income) - float(total_expenses)

        # ── Current month's budget ────────────────────────────────────────────
        now = datetime.utcnow()
        current_budget = Budget.query.filter_by(user_id=user_id, month=now.month, year=now.year).first()
        if current_budget and current_budget.monthly_budget:
            # Use the budget's own tracked spent_amount (synced on every save)
            month_spent    = float(current_budget.spent_amount)
            remaining_budget = round(float(current_budget.monthly_budget) - month_spent, 2)
            budget_usage   = round(month_spent / float(current_budget.monthly_budget) * 100, 2)
            monthly_budget = round(float(current_budget.monthly_budget), 2)
        else:
            remaining_budget = round(max(total_savings, 0), 2)
            budget_usage = 0.0
            monthly_budget = 0.0

        # ── User name ─────────────────────────────────────────────────────────
        user = db.session.get(User, user_id)
        user_name = user.full_name if user else 'User'

        return {
            'user_name':        user_name,
            'total_income':     round(float(total_income), 2),
            'total_expenses':   round(float(total_expenses), 2),
            'total_savings':    round(float(total_savings), 2),
            'remaining_budget': remaining_budget,
            'monthly_budget':   monthly_budget,
            'budget_usage':     budget_usage,
            'income_count':     income_count,
            'expense_count':    expense_count,
        }

    @staticmethod
    def get_recent_transactions(user_id: int) -> list:
        """Fetch the 5 most recent transactions (income + expense combined)."""
        transactions = []

        recent_incomes = (
            Income.query
            .filter_by(user_id=user_id)
            .order_by(Income.income_date.desc(), Income.id.desc())
            .limit(6)
            .all()
        )
        for item in recent_incomes:
            transactions.append({
                'date':     item.income_date.isoformat() if item.income_date else 'N/A',
                'title':    item.title,
                'category': item.source or 'General',
                'type':     'Income',
                'amount':   float(item.amount),
            })

        recent_expenses = (
            Expense.query
            .filter_by(user_id=user_id)
            .order_by(Expense.expense_date.desc(), Expense.id.desc())
            .limit(6)
            .all()
        )
        for item in recent_expenses:
            transactions.append({
                'date':     item.expense_date.isoformat() if item.expense_date else 'N/A',
                'title':    item.title,
                'category': item.category_name or 'General',
                'type':     'Expense',
                'amount':   float(item.amount),
            })

        # Sort combined list and return top 10
        transactions.sort(key=lambda t: t['date'], reverse=True)
        return transactions[:10]

    @staticmethod
    def get_chart_data(user_id: int) -> dict:
        """Chart data for Dashboard — category pie + monthly bar."""
        # ── Category breakdown (expenses only) ───────────────────────────────
        cat_rows = (
            db.session.query(Expense.category_name, func.sum(Expense.amount))
            .filter_by(user_id=user_id)
            .group_by(Expense.category_name)
            .all()
        )
        expense_by_category = [
            {'label': (cat or 'General'), 'value': round(float(total), 2)}
            for cat, total in cat_rows
        ]

        # ── Monthly income vs expense for the current year ────────────────────
        now = datetime.utcnow()
        year = now.year

        income_monthly = (
            db.session.query(extract('month', Income.income_date).label('m'),
                             func.sum(Income.amount).label('total'))
            .filter(Income.user_id == user_id,
                    extract('year', Income.income_date) == year)
            .group_by('m')
            .all()
        )
        expense_monthly = (
            db.session.query(extract('month', Expense.expense_date).label('m'),
                             func.sum(Expense.amount).label('total'))
            .filter(Expense.user_id == user_id,
                    extract('year', Expense.expense_date) == year)
            .group_by('m')
            .all()
        )

        income_map  = {int(m): float(total) for m, total in income_monthly}
        expense_map = {int(m): float(total) for m, total in expense_monthly}

        all_months = sorted(set(income_map.keys()) | set(expense_map.keys()))
        # If no data at all fall back to last 3 months labels
        if not all_months:
            all_months = [((now.month - i - 1) % 12) + 1 for i in range(2, -1, -1)]

        labels  = [MONTHS_SHORT[m - 1] for m in all_months]
        incomes = [round(income_map.get(m, 0.0), 2) for m in all_months]
        exps    = [round(expense_map.get(m, 0.0), 2) for m in all_months]

        return {
            'expense_by_category': expense_by_category,
            'income_vs_expense': {
                'labels':  labels,
                'income':  incomes,
                'expense': exps,
            },
        }
