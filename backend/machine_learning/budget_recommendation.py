"""
Budget Recommendation Engine.
Uses a Random Forest Regressor trained on monthly financial features
to recommend an optimal budget for the next month.
"""

import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

from machine_learning.data_preprocessor import (
    build_monthly_dataframe,
    get_user_data_or_synthetic,
)

MODEL_DIR  = os.path.join(os.path.dirname(__file__), 'models')
BUDGET_PATH = os.path.join(MODEL_DIR, 'budget_rf.joblib')

# Features used for budget recommendation
BUDGET_FEATURES = [
    'total_income', 'rolling_avg_3', 'rolling_avg_6',
    'expense_lag1', 'expense_lag2', 'savings',
    'income_expense_ratio', 'n_transactions',
    'month_sin', 'month_cos',
]

# Target: a "recommended budget" = avg of expense and 85% of income
def _make_target(df):
    return ((df['total_expense'] + 0.85 * df['total_income']) / 2).values


def _train(df):
    df = df.dropna(subset=BUDGET_FEATURES).copy()
    if len(df) < 4:
        return None, None
    X = df[BUDGET_FEATURES].values.astype(np.float64)
    y = _make_target(df)
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, BUDGET_PATH)
    return model, (X, y)


def recommend_budget(expenses: list, incomes: list) -> dict:
    """
    Return a recommended monthly budget for the next month.
    """
    expenses_aug, incomes_aug, used_synthetic = get_user_data_or_synthetic(expenses, incomes)
    df = build_monthly_dataframe(expenses_aug, incomes_aug)

    if df.empty or len(df) < 4:
        return {'error': 'Not enough real transaction history for a reliable budget recommendation. Add more monthly data.'}

    model, train_data = _train(df)
    if model is None:
        return {'error': 'Model training failed'}

    # Evaluate on training data (small dataset — no hold-out split)
    X_tr, y_tr = train_data
    preds = model.predict(X_tr)
    mae = round(float(mean_absolute_error(y_tr, preds)), 2)
    r2  = round(float(r2_score(y_tr, preds)), 4)

    # Build next-month feature vector
    import math
    last = df.iloc[-1]
    next_month_num = (int(last['month_num']) % 12) + 1
    x_next = np.array([[
        float(last['total_income']),
        float(last['rolling_avg_3']),
        float(last['rolling_avg_6']),
        float(last['total_expense']),                          # lag1
        float(last.get('expense_lag1', last['total_expense'])),# lag2
        float(last['savings']),
        float(last['income_expense_ratio']),
        float(last['n_transactions']),
        math.sin(2 * math.pi * next_month_num / 12),
        math.cos(2 * math.pi * next_month_num / 12),
    ]])

    recommended = round(float(max(model.predict(x_next)[0], 0)), 2)

    # Contextual breakdown
    avg_expense   = round(float(df['total_expense'].mean()), 2)
    avg_income    = round(float(df['total_income'].mean()), 2)
    avg_savings   = round(float(df['savings'].mean()), 2)
    savings_rate  = round(avg_savings / avg_income * 100, 1) if avg_income else 0

    # Category-level budget split (proportional to historical spending)
    from collections import defaultdict
    cat_totals: dict = defaultdict(float)
    for e in expenses:
        cat_totals[e.get('category_name') or 'General'] += float(e['amount'])
    total_cat = sum(cat_totals.values()) or 1
    category_split = {
        cat: round(recommended * (amt / total_cat), 2)
        for cat, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
    }

    return {
        'recommended_budget': recommended,
        'avg_monthly_expense': avg_expense,
        'avg_monthly_income':  avg_income,
        'avg_savings':         avg_savings,
        'savings_rate':        savings_rate,
        'category_split':      category_split,
        'model_metrics':       {'mae': mae, 'r2': r2},
        'used_synthetic':      used_synthetic,
    }
