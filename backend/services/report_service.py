from collections import defaultdict
from datetime import datetime, timedelta, date
from sqlalchemy import extract, func
from app import db
from models.Expense import Expense
from models.Income import Income
from models.Budget import Budget


def _expense_q(user_id):
    return Expense.query.filter_by(user_id=user_id)


def _income_q(user_id):
    return Income.query.filter_by(user_id=user_id)


def _build_summary(incomes, expenses, user_id, month=None, year=None):
    """Build a standard report summary dict."""
    total_income = round(sum(i.amount for i in incomes), 2)
    total_expenses = round(sum(e.amount for e in expenses), 2)
    total_savings = round(total_income - total_expenses, 2)
    savings_pct = round((total_savings / total_income * 100), 2) if total_income else 0

    # Budget for the period (only meaningful for monthly)
    remaining_budget = None
    budget_utilization = None
    if month and year:
        budget = Budget.query.filter_by(user_id=user_id, month=month, year=year).first()
        if budget:
            remaining_budget = round(budget.monthly_budget - total_expenses, 2)
            budget_utilization = round((total_expenses / budget.monthly_budget * 100), 2) if budget.monthly_budget else 0

    # Category breakdown
    cat_totals = defaultdict(float)
    for e in expenses:
        cat_totals[e.category_name or 'General'] += e.amount
    top_categories = sorted(
        [{'category': k, 'amount': round(v, 2)} for k, v in cat_totals.items()],
        key=lambda x: x['amount'], reverse=True
    )

    # Transactions list
    transactions = []
    for i in incomes:
        transactions.append({
            'date': i.income_date.isoformat() if i.income_date else '',
            'title': i.title,
            'type': 'Income',
            'category': i.source or 'General',
            'amount': float(i.amount),
        })
    for e in expenses:
        transactions.append({
            'date': e.expense_date.isoformat() if e.expense_date else '',
            'title': e.title,
            'type': 'Expense',
            'category': e.category_name or 'General',
            'amount': float(e.amount),
        })
    transactions.sort(key=lambda x: x['date'], reverse=True)

    result = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'total_savings': total_savings,
        'savings_percentage': savings_pct,
        'transaction_count': len(transactions),
        'top_categories': top_categories[:5],
        'transactions': transactions,
    }
    if remaining_budget is not None:
        result['remaining_budget'] = remaining_budget
        result['budget_utilization'] = budget_utilization
    return result


class ReportService:
    """Service for generating time-based financial reports and analytics."""

    @staticmethod
    def daily_report(user_id, report_date=None):
        """Report for a single day."""
        if report_date is None:
            report_date = date.today()
        elif isinstance(report_date, str):
            report_date = date.fromisoformat(report_date)

        expenses = _expense_q(user_id).filter(Expense.expense_date == report_date).all()
        incomes = _income_q(user_id).filter(Income.income_date == report_date).all()
        summary = _build_summary(incomes, expenses, user_id)
        summary['period'] = report_date.isoformat()
        summary['period_type'] = 'daily'
        return summary

    @staticmethod
    def weekly_report(user_id, ref_date=None):
        """Report for the ISO week containing ref_date."""
        if ref_date is None:
            ref_date = date.today()
        elif isinstance(ref_date, str):
            ref_date = date.fromisoformat(ref_date)

        week_start = ref_date - timedelta(days=ref_date.weekday())
        week_end = week_start + timedelta(days=6)

        expenses = _expense_q(user_id).filter(
            Expense.expense_date >= week_start,
            Expense.expense_date <= week_end,
        ).all()
        incomes = _income_q(user_id).filter(
            Income.income_date >= week_start,
            Income.income_date <= week_end,
        ).all()

        # Daily breakdown for the week
        daily = defaultdict(lambda: {'income': 0.0, 'expense': 0.0})
        for i in incomes:
            daily[i.income_date.isoformat()]['income'] += float(i.amount)
        for e in expenses:
            daily[e.expense_date.isoformat()]['expense'] += float(e.amount)

        summary = _build_summary(incomes, expenses, user_id)
        summary['period'] = f"{week_start.isoformat()} to {week_end.isoformat()}"
        summary['period_type'] = 'weekly'
        summary['daily_breakdown'] = {
            'labels': list(daily.keys()),
            'income': [round(v['income'], 2) for v in daily.values()],
            'expense': [round(v['expense'], 2) for v in daily.values()],
        }
        return summary

    @staticmethod
    def monthly_report(user_id, month=None, year=None):
        """Report for a specific month/year."""
        now = datetime.utcnow()
        month = int(month) if month else now.month
        year = int(year) if year else now.year

        expenses = _expense_q(user_id).filter(
            extract('month', Expense.expense_date) == month,
            extract('year', Expense.expense_date) == year,
        ).all()
        incomes = _income_q(user_id).filter(
            extract('month', Income.income_date) == month,
            extract('year', Income.income_date) == year,
        ).all()

        # Weekly breakdown within the month
        weekly = defaultdict(lambda: {'income': 0.0, 'expense': 0.0})
        for i in incomes:
            wk = f"W{i.income_date.isocalendar()[1]}"
            weekly[wk]['income'] += float(i.amount)
        for e in expenses:
            wk = f"W{e.expense_date.isocalendar()[1]}"
            weekly[wk]['expense'] += float(e.amount)

        summary = _build_summary(incomes, expenses, user_id, month=month, year=year)
        summary['period'] = f"{year}-{month:02d}"
        summary['period_type'] = 'monthly'
        summary['weekly_breakdown'] = {
            'labels': list(weekly.keys()),
            'income': [round(v['income'], 2) for v in weekly.values()],
            'expense': [round(v['expense'], 2) for v in weekly.values()],
        }
        return summary

    @staticmethod
    def yearly_report(user_id, year=None):
        """Report for a full year with monthly breakdown."""
        year = int(year) if year else datetime.utcnow().year

        expenses = _expense_q(user_id).filter(
            extract('year', Expense.expense_date) == year,
        ).all()
        incomes = _income_q(user_id).filter(
            extract('year', Income.income_date) == year,
        ).all()

        MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        monthly = {m: {'income': 0.0, 'expense': 0.0} for m in MONTHS}
        for i in incomes:
            monthly[MONTHS[i.income_date.month - 1]]['income'] += float(i.amount)
        for e in expenses:
            monthly[MONTHS[e.expense_date.month - 1]]['expense'] += float(e.amount)

        summary = _build_summary(incomes, expenses, user_id)
        summary['period'] = str(year)
        summary['period_type'] = 'yearly'
        summary['monthly_breakdown'] = {
            'labels': MONTHS,
            'income': [round(monthly[m]['income'], 2) for m in MONTHS],
            'expense': [round(monthly[m]['expense'], 2) for m in MONTHS],
            'savings': [round(monthly[m]['income'] - monthly[m]['expense'], 2) for m in MONTHS],
        }
        return summary

    @staticmethod
    def analytics(user_id, month=None, year=None):
        """Full analytics: categories, trends, budget utilization, savings."""
        now = datetime.utcnow()
        month = int(month) if month else now.month
        year = int(year) if year else now.year

        all_expenses = _expense_q(user_id).all()
        all_incomes = _income_q(user_id).all()

        # Month-scoped
        month_expenses = [e for e in all_expenses
                          if e.expense_date and e.expense_date.month == month and e.expense_date.year == year]
        month_incomes = [i for i in all_incomes
                         if i.income_date and i.income_date.month == month and i.income_date.year == year]

        # Top spending categories (all time)
        cat_totals = defaultdict(float)
        for e in all_expenses:
            cat_totals[e.category_name or 'General'] += float(e.amount)
        top_categories = sorted(
            [{'category': k, 'amount': round(v, 2)} for k, v in cat_totals.items()],
            key=lambda x: x['amount'], reverse=True
        )[:5]

        # Category-wise for current month
        month_cat = defaultdict(float)
        for e in month_expenses:
            month_cat[e.category_name or 'General'] += float(e.amount)
        category_breakdown = [
            {'category': k, 'amount': round(v, 2)} for k, v in
            sorted(month_cat.items(), key=lambda x: x[1], reverse=True)
        ]

        # Highest expense / income
        highest_expense = max(all_expenses, key=lambda e: e.amount, default=None)
        highest_income = max(all_incomes, key=lambda i: i.amount, default=None)

        # Monthly trend (last 12 months)
        MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        trend = {m: {'income': 0.0, 'expense': 0.0} for m in MONTHS}
        for i in all_incomes:
            if i.income_date and i.income_date.year == year:
                trend[MONTHS[i.income_date.month - 1]]['income'] += float(i.amount)
        for e in all_expenses:
            if e.expense_date and e.expense_date.year == year:
                trend[MONTHS[e.expense_date.month - 1]]['expense'] += float(e.amount)

        # Savings trend
        savings_trend = [round(trend[m]['income'] - trend[m]['expense'], 2) for m in MONTHS]

        # Budget utilization for current month
        budget = Budget.query.filter_by(user_id=user_id, month=month, year=year).first()
        month_spent = round(sum(e.amount for e in month_expenses), 2)
        budget_utilization = None
        if budget:
            budget_utilization = {
                'monthly_budget': round(budget.monthly_budget, 2),
                'spent': month_spent,
                'remaining': round(budget.monthly_budget - month_spent, 2),
                'usage_pct': round(month_spent / budget.monthly_budget * 100, 2) if budget.monthly_budget else 0,
                'status': budget.budget_status,
            }

        # Savings percentage
        total_income_all = sum(i.amount for i in all_incomes)
        total_expense_all = sum(e.amount for e in all_expenses)
        savings_pct = round(((total_income_all - total_expense_all) / total_income_all * 100), 2) if total_income_all else 0

        return {
            'top_categories': top_categories,
            'category_breakdown': category_breakdown,
            'highest_expense': {
                'title': highest_expense.title,
                'amount': float(highest_expense.amount),
                'date': highest_expense.expense_date.isoformat(),
                'category': highest_expense.category_name or 'General',
            } if highest_expense else None,
            'highest_income': {
                'title': highest_income.title,
                'amount': float(highest_income.amount),
                'date': highest_income.income_date.isoformat(),
                'source': highest_income.source or 'General',
            } if highest_income else None,
            'monthly_trend': {
                'labels': MONTHS,
                'income': [round(trend[m]['income'], 2) for m in MONTHS],
                'expense': [round(trend[m]['expense'], 2) for m in MONTHS],
            },
            'savings_trend': {
                'labels': MONTHS,
                'values': savings_trend,
            },
            'budget_utilization': budget_utilization,
            'savings_percentage': savings_pct,
            'total_income': round(total_income_all, 2),
            'total_expenses': round(total_expense_all, 2),
            'period': f"{year}-{month:02d}",
        }
