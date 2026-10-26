"""
Data preprocessing pipeline for FinTrack AI ML module.
Handles feature engineering, encoding, normalisation, and synthetic data
generation when a user has insufficient history for training.
"""

import numpy as np
import pandas as pd
from datetime import date, timedelta
from collections import defaultdict


# ── Synthetic data generation ─────────────────────────────────────────────────

SYNTHETIC_CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Bills', 'Education']

def _generate_synthetic_monthly(n_months: int = 18) -> tuple[list, list]:
    """
    Generate realistic synthetic monthly expense/income rows.
    Returns (expense_rows, income_rows) as lists of dicts.
    """
    rng = np.random.default_rng(42)
    today = date.today()
    expenses, incomes = [], []

    base_income = rng.uniform(3000, 6000)
    base_expense = base_income * rng.uniform(0.55, 0.80)

    for m in range(n_months, 0, -1):
        ref = today.replace(day=1) - timedelta(days=m * 30)
        month_income = base_income * rng.uniform(0.92, 1.12)
        month_expense = base_expense * rng.uniform(0.85, 1.20)

        incomes.append({
            'amount': round(month_income, 2),
            'income_date': ref,
            'source': 'Salary',
        })

        # Spread expense across 3-8 transactions
        n_tx = int(rng.integers(3, 9))
        amounts = rng.dirichlet(np.ones(n_tx)) * month_expense
        for i, amt in enumerate(amounts):
            expenses.append({
                'amount': round(float(amt), 2),
                'expense_date': ref + timedelta(days=int(rng.integers(0, 28))),
                'category_name': SYNTHETIC_CATEGORIES[i % len(SYNTHETIC_CATEGORIES)],
            })

    return expenses, incomes


# ── Feature builders ──────────────────────────────────────────────────────────

def build_monthly_dataframe(expenses: list, incomes: list) -> pd.DataFrame:
    """
    Aggregate raw expense/income rows into a monthly feature DataFrame.

    Columns produced:
        month_num, year, month_sin, month_cos,
        total_expense, total_income, savings,
        income_expense_ratio, rolling_avg_3, rolling_avg_6,
        expense_lag1, expense_lag2, expense_lag3,
        n_transactions, top_category_encoded
    """
    if not expenses:
        return pd.DataFrame()

    # ── Monthly aggregation ───────────────────────────────────────────────────
    monthly: dict = defaultdict(lambda: {
        'expense': 0.0, 'income': 0.0, 'n_tx': 0, 'categories': []
    })

    for e in expenses:
        d = e['expense_date']
        key = (d.year, d.month)
        monthly[key]['expense'] += float(e['amount'])
        monthly[key]['n_tx'] += 1
        monthly[key]['categories'].append(e.get('category_name') or 'General')

    for i in incomes:
        d = i['income_date']
        key = (d.year, d.month)
        monthly[key]['income'] += float(i['amount'])

    rows = []
    for (yr, mo), v in sorted(monthly.items()):
        top_cat = max(set(v['categories']), key=v['categories'].count) if v['categories'] else 'General'
        rows.append({
            'year': yr,
            'month_num': mo,
            'total_expense': round(v['expense'], 2),
            'total_income': round(v['income'], 2),
            'n_transactions': v['n_tx'],
            'top_category': top_cat,
        })

    df = pd.DataFrame(rows).sort_values(['year', 'month_num']).reset_index(drop=True)

    # ── Feature engineering ───────────────────────────────────────────────────
    # Cyclical month encoding
    df['month_sin'] = np.sin(2 * np.pi * df['month_num'] / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['month_num'] / 12)

    # Savings & ratio
    df['savings'] = df['total_income'] - df['total_expense']
    df['income_expense_ratio'] = np.where(
        df['total_income'] > 0,
        df['total_expense'] / df['total_income'],
        1.0,
    )

    # Lag features
    df['expense_lag1'] = df['total_expense'].shift(1)
    df['expense_lag2'] = df['total_expense'].shift(2)
    df['expense_lag3'] = df['total_expense'].shift(3)

    # Rolling averages
    df['rolling_avg_3'] = df['total_expense'].rolling(3, min_periods=1).mean()
    df['rolling_avg_6'] = df['total_expense'].rolling(6, min_periods=1).mean()

    # Encode top category
    cat_map = {c: i for i, c in enumerate(SYNTHETIC_CATEGORIES + ['General'])}
    df['top_category_encoded'] = df['top_category'].map(lambda c: cat_map.get(c, len(cat_map)))

    # Fill NaN lags with rolling mean
    for col in ['expense_lag1', 'expense_lag2', 'expense_lag3']:
        df[col] = df[col].fillna(df['rolling_avg_3'])

    return df


def get_feature_columns() -> list[str]:
    return [
        'month_num', 'month_sin', 'month_cos',
        'total_income', 'savings', 'income_expense_ratio',
        'expense_lag1', 'expense_lag2', 'expense_lag3',
        'rolling_avg_3', 'rolling_avg_6',
        'n_transactions', 'top_category_encoded',
    ]


def prepare_training_data(df: pd.DataFrame):
    """
    Return (X, y) numpy arrays ready for sklearn.
    Drops rows with NaN in feature columns.
    """
    features = get_feature_columns()
    target = 'total_expense'
    df_clean = df.dropna(subset=features + [target]).copy()
    X = df_clean[features].values.astype(np.float64)
    y = df_clean[target].values.astype(np.float64)
    return X, y


def get_user_data_or_synthetic(expenses: list, incomes: list):
    """
    Preserve only real user data. Synthetic augmentation is intentionally disabled
    so predictions and recommendations never invent missing financial history.
    Returns (expenses, incomes, used_synthetic: bool).
    """
    return expenses, incomes, False
