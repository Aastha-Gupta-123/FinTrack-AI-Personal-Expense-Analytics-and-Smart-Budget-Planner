"""
CategoryService — CRUD for user-defined expense/income categories.
"""
from datetime import datetime
from app import db
from models.Category import Category


DEFAULT_CATEGORIES = [
    {'category_name': 'Food',           'category_type': 'expense'},
    {'category_name': 'Transportation', 'category_type': 'expense'},
    {'category_name': 'Shopping',       'category_type': 'expense'},
    {'category_name': 'Entertainment',  'category_type': 'expense'},
    {'category_name': 'Healthcare',     'category_type': 'expense'},
    {'category_name': 'Education',      'category_type': 'expense'},
    {'category_name': 'Bills',          'category_type': 'expense'},
    {'category_name': 'Travel',         'category_type': 'expense'},
    {'category_name': 'Investment',     'category_type': 'expense'},
    {'category_name': 'Others',         'category_type': 'expense'},
    {'category_name': 'Salary',         'category_type': 'income'},
    {'category_name': 'Freelancing',    'category_type': 'income'},
    {'category_name': 'Business',       'category_type': 'income'},
    {'category_name': 'Investments',    'category_type': 'income'},
    {'category_name': 'Other Income',   'category_type': 'income'},
]


class CategoryService:
    """Business logic for category CRUD operations."""

    @staticmethod
    def list_categories(user_id: int) -> list:
        cats = Category.query.filter_by(user_id=user_id).all()
        return [{'id': c.id, 'category_name': c.category_name, 'category_type': c.category_type} for c in cats]

    @staticmethod
    def ensure_defaults(user_id: int) -> None:
        """Seed default categories for a new user if none exist."""
        if Category.query.filter_by(user_id=user_id).count() == 0:
            for item in DEFAULT_CATEGORIES:
                db.session.add(Category(user_id=user_id, **item))
            db.session.commit()

    @staticmethod
    def create_category(user_id: int, data: dict) -> dict:
        name = str(data.get('category_name', '')).strip()
        ctype = str(data.get('category_type', 'expense')).strip().lower()
        if not name:
            raise ValueError('Category name is required')
        if ctype not in ('expense', 'income'):
            raise ValueError('Category type must be expense or income')
        if Category.query.filter_by(user_id=user_id, category_name=name, category_type=ctype).first():
            raise ValueError('Category already exists')
        cat = Category(user_id=user_id, category_name=name, category_type=ctype)
        db.session.add(cat)
        db.session.commit()
        return {'id': cat.id, 'category_name': cat.category_name, 'category_type': cat.category_type}

    @staticmethod
    def delete_category(user_id: int, category_id: int) -> None:
        cat = Category.query.filter_by(user_id=user_id, id=category_id).first()
        if not cat:
            raise ValueError('Category not found')
        db.session.delete(cat)
        db.session.commit()
