"""
Expense Prediction using Linear Regression and Random Forest Regressor.
Trains both models, evaluates them, selects the best, and persists with joblib.
"""

import os
import numpy as np
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from machine_learning.data_preprocessor import (
    build_monthly_dataframe,
    prepare_training_data,
    get_feature_columns,
    get_user_data_or_synthetic,
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
LR_PATH   = os.path.join(MODEL_DIR, 'expense_lr.joblib')
RF_PATH   = os.path.join(MODEL_DIR, 'expense_rf.joblib')
SC_PATH   = os.path.join(MODEL_DIR, 'expense_scaler.joblib')


def _evaluate(model, X_test, y_test, scaler=None) -> dict:
    X_in = scaler.transform(X_test) if scaler else X_test
    preds = model.predict(X_in)
    mae  = float(mean_absolute_error(y_test, preds))
    mse  = float(mean_squared_error(y_test, preds))
    rmse = float(np.sqrt(mse))
    r2   = float(r2_score(y_test, preds))
    return {'mae': round(mae, 2), 'mse': round(mse, 2), 'rmse': round(rmse, 2), 'r2': round(r2, 4)}


def train_and_select(expenses: list, incomes: list) -> dict:
    """
    Train LR and RF on user (+ synthetic) data.
    Returns evaluation metrics and the name of the selected model.
    """
    expenses, incomes, used_synthetic = get_user_data_or_synthetic(expenses, incomes)
    df = build_monthly_dataframe(expenses, incomes)
    if df.empty:
        return {'error': 'Not enough real transaction history to generate a reliable expense prediction. Add more income and expense records.'}

    X, y = prepare_training_data(df)

    if len(X) < 4:
        return {'error': 'Not enough real transaction history to generate a reliable expense prediction. Add more income and expense records.'}

    # Use all data for training when dataset is small; otherwise split 80/20
    if len(X) >= 10:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    else:
        X_train, X_test, y_train, y_test = X, X, y, y

    # Scale for Linear Regression
    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    # ── Linear Regression ─────────────────────────────────────────────────────
    lr = LinearRegression()
    lr.fit(X_train_sc, y_train)
    lr_metrics = _evaluate(lr, X_test, y_test, scaler)

    # ── Random Forest ─────────────────────────────────────────────────────────
    rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_metrics = _evaluate(rf, X_test, y_test)

    # ── Select best by RMSE ───────────────────────────────────────────────────
    best = 'random_forest' if rf_metrics['rmse'] <= lr_metrics['rmse'] else 'linear_regression'

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(lr,     LR_PATH)
    joblib.dump(rf,     RF_PATH)
    joblib.dump(scaler, SC_PATH)

    return {
        'linear_regression': lr_metrics,
        'random_forest':     rf_metrics,
        'best_model':        best,
        'used_synthetic':    used_synthetic,
        'training_samples':  len(X_train),
    }


def predict_next_month(expenses: list, incomes: list) -> dict:
    """
    Predict next month's total expense.
    Trains if no saved model exists, then returns prediction + metrics.
    """
    # Always retrain to reflect latest user data
    metrics = train_and_select(expenses, incomes)
    if 'error' in metrics:
        return metrics

    expenses_aug, incomes_aug, used_synthetic = get_user_data_or_synthetic(expenses, incomes)
    df = build_monthly_dataframe(expenses_aug, incomes_aug)
    X, y = prepare_training_data(df)

    best_name = metrics['best_model']

    # Build next-month feature vector from the last row
    last = df.iloc[-1]
    import math
    next_month_num = (int(last['month_num']) % 12) + 1
    next_row = {
        'month_num':             next_month_num,
        'month_sin':             math.sin(2 * math.pi * next_month_num / 12),
        'month_cos':             math.cos(2 * math.pi * next_month_num / 12),
        'total_income':          float(last['total_income']),
        'savings':               float(last['savings']),
        'income_expense_ratio':  float(last['income_expense_ratio']),
        'expense_lag1':          float(last['total_expense']),
        'expense_lag2':          float(last.get('expense_lag1', last['total_expense'])),
        'expense_lag3':          float(last.get('expense_lag2', last['total_expense'])),
        'rolling_avg_3':         float(last['rolling_avg_3']),
        'rolling_avg_6':         float(last['rolling_avg_6']),
        'n_transactions':        float(last['n_transactions']),
        'top_category_encoded':  float(last['top_category_encoded']),
    }
    X_next = np.array([[next_row[c] for c in get_feature_columns()]])

    if best_name == 'linear_regression':
        scaler = joblib.load(SC_PATH)
        model  = joblib.load(LR_PATH)
        pred   = float(model.predict(scaler.transform(X_next))[0])
    else:
        model = joblib.load(RF_PATH)
        pred  = float(model.predict(X_next)[0])

    # Historical monthly expenses for trend chart
    trend_labels  = [f"{int(r['year'])}-{int(r['month_num']):02d}" for _, r in df.tail(12).iterrows()]
    trend_actuals = [round(float(r['total_expense']), 2) for _, r in df.tail(12).iterrows()]

    return {
        'predicted_expense':  round(max(pred, 0), 2),
        'best_model':         best_name,
        'model_metrics':      metrics[best_name],
        'all_metrics':        metrics,
        'used_synthetic':     used_synthetic,
        'trend': {
            'labels':  trend_labels,
            'actuals': trend_actuals,
        },
    }
