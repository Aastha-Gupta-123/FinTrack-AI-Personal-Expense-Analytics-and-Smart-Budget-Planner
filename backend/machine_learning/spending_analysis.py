"""
Spending Pattern Analysis and Overspending Risk Detection.
Uses statistical methods and Z-score anomaly detection.
"""

import numpy as np
from collections import defaultdict
from datetime import datetime

from machine_learning.data_preprocessor import (
    build_monthly_dataframe,
    get_user_data_or_synthetic,
)


def analyse_spending(expenses: list, incomes: list) -> dict:
    """
    Full spending pattern analysis.
    Returns category breakdown, monthly trends, risk score, and anomaly flags.
    """
    expenses_aug, incomes_aug, used_synthetic = get_user_data_or_synthetic(expenses, incomes)
    df = build_monthly_dataframe(expenses_aug, incomes_aug)

    if df.empty:
        return {'error': 'No real transaction data available for spending analysis.'}

    # ── Category analysis ─────────────────────────────────────────────────────
    cat_totals: dict = defaultdict(float)
    cat_counts: dict = defaultdict(int)
    for e in expenses:
        cat = e.get('category_name') or 'General'
        cat_totals[cat] += float(e['amount'])
        cat_counts[cat] += 1

    total_spent = sum(cat_totals.values()) or 1
    top_categories = sorted(
        [{'category': k, 'amount': round(v, 2), 'percentage': round(v / total_spent * 100, 1),
          'count': cat_counts[k]}
         for k, v in cat_totals.items()],
        key=lambda x: x['amount'], reverse=True,
    )

    # ── Monthly trend ─────────────────────────────────────────────────────────
    monthly_labels  = [f"{int(r['year'])}-{int(r['month_num']):02d}" for _, r in df.iterrows()]
    monthly_expense = [round(float(r['total_expense']), 2) for _, r in df.iterrows()]
    monthly_income  = [round(float(r['total_income']),  2) for _, r in df.iterrows()]
    monthly_savings = [round(float(r['savings']),        2) for _, r in df.iterrows()]

    # ── Most / least expensive months ────────────────────────────────────────
    max_idx = int(np.argmax(monthly_expense))
    min_idx = int(np.argmin(monthly_expense))
    most_expensive_month  = {'period': monthly_labels[max_idx],  'amount': monthly_expense[max_idx]}
    least_expensive_month = {'period': monthly_labels[min_idx], 'amount': monthly_expense[min_idx]}

    # ── Income vs Expense ratio ───────────────────────────────────────────────
    avg_income  = round(float(df['total_income'].mean()), 2)
    avg_expense = round(float(df['total_expense'].mean()), 2)
    ie_ratio    = round(avg_expense / avg_income, 4) if avg_income else 1.0

    # ── Overspending risk (Z-score on last 3 months vs history) ──────────────
    expense_arr = np.array(monthly_expense, dtype=float)
    mean_exp = expense_arr.mean()
    std_exp  = expense_arr.std() if expense_arr.std() > 0 else 1.0
    recent_3 = expense_arr[-3:].mean() if len(expense_arr) >= 3 else expense_arr.mean()
    z_score  = float((recent_3 - mean_exp) / std_exp)

    if z_score > 1.5:
        risk_level = 'High'
        risk_message = 'Your recent spending is significantly above your historical average.'
    elif z_score > 0.5:
        risk_level = 'Medium'
        risk_message = 'Your spending is trending upward. Monitor closely.'
    else:
        risk_level = 'Low'
        risk_message = 'Your spending is within normal range.'

    # ── Spending volatility ───────────────────────────────────────────────────
    volatility = round(float(expense_arr.std()), 2)
    cv = round(volatility / mean_exp * 100, 1) if mean_exp else 0  # coefficient of variation %

    return {
        'top_categories':        top_categories[:6],
        'most_expensive_month':  most_expensive_month,
        'least_expensive_month': least_expensive_month,
        'avg_monthly_income':    avg_income,
        'avg_monthly_expense':   avg_expense,
        'income_expense_ratio':  ie_ratio,
        'overspending_risk': {
            'level':   risk_level,
            'z_score': round(z_score, 3),
            'message': risk_message,
        },
        'volatility': {
            'std_dev': volatility,
            'cv_pct':  cv,
        },
        'trend': {
            'labels':  monthly_labels[-12:],
            'expense': monthly_expense[-12:],
            'income':  monthly_income[-12:],
            'savings': monthly_savings[-12:],
        },
        'used_synthetic': used_synthetic,
    }
