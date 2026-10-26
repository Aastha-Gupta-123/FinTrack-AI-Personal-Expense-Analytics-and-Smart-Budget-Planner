from datetime import date

import pytest

from app import create_app, db
from models.Expense import Expense
from models.Income import Income
from models.User import User
from services.prediction_service import PredictionService


@pytest.fixture()
def client():
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.drop_all()
            db.create_all()
        yield client


def test_register_and_login(client):
    response = client.post('/api/auth/register', json={
        'full_name': 'Test User',
        'email': 'test@example.com',
        'phone': '1234567890',
        'password': 'password123',
        'confirm_password': 'password123'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True

    login_response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    assert 'data' in login_data
    assert 'access_token' in login_data['data']


def test_ml_returns_insufficient_history_for_user_without_transactions():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()

        user = User(full_name='New User', email='new@example.com', phone='1234567890', password='hashed')
        db.session.add(user)
        db.session.commit()

        result = PredictionService.predict_expense(user.id)

        assert result.get('error') == (
            'Not enough real transaction history to generate a reliable expense prediction. '
            'Add more income and expense records.'
        )


def test_ml_uses_real_user_data_when_history_is_too_short():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()

        user = User(full_name='Real User', email='real@example.com', phone='1234567890', password='hashed')
        db.session.add(user)
        db.session.commit()

        db.session.add_all([
            Expense(user_id=user.id, title='Groceries', amount=900.0, category_name='Food', expense_date=date(2026, 1, 10)),
            Expense(user_id=user.id, title='Transport', amount=300.0, category_name='Travel', expense_date=date(2026, 2, 10)),
            Income(user_id=user.id, source='Salary', title='Salary', amount=3500.0, income_date=date(2026, 1, 1)),
        ])
        db.session.commit()

        result = PredictionService.predict_expense(user.id)

        assert 'error' in result
        assert result.get('used_synthetic', False) is False
