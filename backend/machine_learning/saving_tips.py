"""
Personalized Saving Tips Engine.
Generates dynamic, data-driven suggestions based on the user's
actual financial patterns — not hardcoded text.
"""

from collections import defaultdict
from machine_learning.data_preprocessor import (
    build_monthly_dataframe,
    get_user_data_or_synthetic,
)


def generate_saving_tips(expenses: list, incomes: list, budgets: list) -> dict:
    """
    Analyse the user's financial data and return personalised saving tips.

    Parameters
    ----------
    expenses : list of expense dicts (amount, expense_date, category_name)
    incomes  : list of income dicts  (amount, income_date)
    budgets  : list of budget dicts  (monthly_budget, spent_amount, budget_status)
    """
    expenses_aug, incomes_aug, used_synthetic = get_user_data_or_synthetic(expenses, incomes)
    df = build_monthly_dataframe(expenses_aug, incomes_aug)

    tips = []
    priority_map = {'critical': 1, 'warning': 2, 'info': 3}

    if df.empty:
        return {'tips': [{'level': 'info', 'message': 'Add more real income and expense records to receive personalised tips.'}],
                'used_synthetic': used_synthetic}

    avg_income  = float(df['total_income'].mean())
    avg_expense = float(df['total_expense'].mean())
    avg_savings = float(df['savings'].mean())
    savings_rate = (avg_savings / avg_income * 100) if avg_income else 0

    # ── Category breakdown ────────────────────────────────────────────────────
    cat_totals: dict = defaultdict(float)
    for e in expenses:
        cat_totals[e.get('category_name') or 'General'] += float(e['amount'])
    total_spent = sum(cat_totals.values()) or 1
    cat_pct = {k: v / total_spent * 100 for k, v in cat_totals.items()}

    # ── Budget status ─────────────────────────────────────────────────────────
    overspent_months = sum(1 for b in budgets if b.get('budget_status') == 'Overspent')
    warning_months   = sum(1 for b in budgets if b.get('budget_status') == 'Warning')

    # ── Rule engine ───────────────────────────────────────────────────────────

    # 1. Savings rate
    if savings_rate < 10:
        tips.append({
            'level': 'critical',
            'category': 'Savings',
            'message': f'Your savings rate is only {savings_rate:.1f}%. Aim for at least 20% by reducing non-essential spending.',
            'potential_saving': round(avg_income * 0.20 - avg_savings, 2),
        })
    elif savings_rate < 20:
        tips.append({
            'level': 'warning',
            'category': 'Savings',
            'message': f'Your savings rate is {savings_rate:.1f}%. Small cuts in discretionary spending could push you above 20%.',
            'potential_saving': round(avg_income * 0.20 - avg_savings, 2),
        })
    else:
        tips.append({
            'level': 'info',
            'category': 'Savings',
            'message': f'Great! Your savings rate is {savings_rate:.1f}%. Consider investing the surplus.',
            'potential_saving': 0,
        })

    # 2. High-spend categories (>30% of total)
    for cat, pct in sorted(cat_pct.items(), key=lambda x: x[1], reverse=True):
        if pct > 30:
            tips.append({
                'level': 'warning',
                'category': cat,
                'message': f'{cat} accounts for {pct:.1f}% of your spending. Try to reduce it by 10–15%.',
                'potential_saving': round(cat_totals[cat] / len(df) * 0.12, 2),
            })
        elif pct > 20 and cat.lower() in ('food', 'shopping', 'entertainment'):
            tips.append({
                'level': 'info',
                'category': cat,
                'message': f'You spend {pct:.1f}% on {cat}. Meal planning or a spending cap could help.',
                'potential_saving': round(cat_totals[cat] / len(df) * 0.10, 2),
            })

    # 3. Budget overspending
    if overspent_months > 0:
        tips.append({
            'level': 'critical',
            'category': 'Budget',
            'message': f'You exceeded your budget in {overspent_months} month(s). Review your largest expense categories.',
            'potential_saving': 0,
        })
    if warning_months > 0:
        tips.append({
            'level': 'warning',
            'category': 'Budget',
            'message': f'You were in the warning zone in {warning_months} month(s). Consider tightening your budget.',
            'potential_saving': 0,
        })

    # 4. Income vs expense gap
    if avg_expense > avg_income * 0.90:
        tips.append({
            'level': 'critical',
            'category': 'Cash Flow',
            'message': f'Your expenses (${avg_expense:.0f}) are {avg_expense/avg_income*100:.0f}% of your income. This is unsustainable.',
            'potential_saving': round(avg_expense - avg_income * 0.75, 2),
        })

    # 5. Spending trend (last 3 months vs previous 3)
    if len(df) >= 6:
        recent_avg = float(df['total_expense'].iloc[-3:].mean())
        prior_avg  = float(df['total_expense'].iloc[-6:-3].mean())
        if prior_avg > 0 and recent_avg > prior_avg * 1.15:
            pct_up = (recent_avg - prior_avg) / prior_avg * 100
            tips.append({
                'level': 'warning',
                'category': 'Trend',
                'message': f'Your spending has increased by {pct_up:.1f}% over the last 3 months. Identify what changed.',
                'potential_saving': round(recent_avg - prior_avg, 2),
            })

    # Sort by priority
    tips.sort(key=lambda t: priority_map.get(t['level'], 9))

    return {
        'tips': tips[:8],  # cap at 8 tips
        'summary': {
            'avg_monthly_income':  round(avg_income, 2),
            'avg_monthly_expense': round(avg_expense, 2),
            'avg_savings':         round(avg_savings, 2),
            'savings_rate':        round(savings_rate, 1),
        },
        'used_synthetic': used_synthetic,
    }
