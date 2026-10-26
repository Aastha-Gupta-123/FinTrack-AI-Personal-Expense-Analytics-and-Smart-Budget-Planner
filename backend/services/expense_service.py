from datetime import datetime, date
from app import db
from models.Expense import Expense
from utils.validators import validate_required_fields


class ExpenseService:
    """Business logic for expense CRUD and filtering."""

    @staticmethod
    def list_expenses(user_id, page=1, per_page=10, search='', category='', date='', sort='expense_date'):
        query = Expense.query.filter_by(user_id=user_id)
        if search:
            search_term = f'%{search.lower()}%'
            query = query.filter(Expense.title.ilike(search_term))
        if category:
            query = query.filter(Expense.category_name == category)
        if date:
            query = query.filter(Expense.expense_date == date)
        if sort == 'amount_desc':
            query = query.order_by(Expense.amount.desc())
        elif sort == 'amount_asc':
            query = query.order_by(Expense.amount.asc())
        elif sort == 'date_desc':
            query = query.order_by(Expense.expense_date.desc())
        else:
            query = query.order_by(Expense.expense_date.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        expenses = [expense.to_dict() for expense in pagination.items]
        return expenses, pagination.total

    @staticmethod
    def create_expense(user_id, data):
        required_fields = ['title', 'amount', 'category_name', 'expense_date']
        missing = validate_required_fields(data, required_fields)
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        amount = float(data.get('amount'))
        if amount <= 0:
            raise ValueError('Amount must be greater than zero')

        expense_date = data.get('expense_date')
        if isinstance(expense_date, str):
            try:
                expense_date = date.fromisoformat(expense_date)
            except ValueError:
                raise ValueError('Expense date must be a valid date')

        expense = Expense(
            user_id=user_id,
            title=str(data.get('title', '')).strip(),
            description=str(data.get('description', '')).strip(),
            amount=amount,
            category_name=str(data.get('category_name', '')).strip(),
            payment_method=str(data.get('payment_method', '')).strip() or 'Cash',
            expense_date=expense_date,
        )
        db.session.add(expense)
        db.session.commit()
        return expense.to_dict()

    @staticmethod
    def get_expense(user_id, expense_id):
        expense = Expense.query.filter_by(user_id=user_id, id=expense_id).first()
        if not expense:
            raise ValueError('Expense not found')
        return expense.to_dict()

    @staticmethod
    def update_expense(user_id, expense_id, data):
        expense = Expense.query.filter_by(user_id=user_id, id=expense_id).first()
        if not expense:
            raise ValueError('Expense not found')

        if 'title' in data and not str(data.get('title', '')).strip():
            raise ValueError('Title is required')
        if 'amount' in data:
            amount = float(data.get('amount'))
            if amount <= 0:
                raise ValueError('Amount must be greater than zero')
            expense.amount = amount
        if 'category_name' in data and not str(data.get('category_name', '')).strip():
            raise ValueError('Category is required')
        if 'expense_date' in data and not data.get('expense_date'):
            raise ValueError('Expense date is required')

        for field in ['title', 'description', 'category_name', 'payment_method']:
            if field in data:
                setattr(expense, field, str(data.get(field, '')).strip())

        if 'expense_date' in data:
            val = data.get('expense_date')
            if isinstance(val, str):
                try:
                    expense.expense_date = date.fromisoformat(val)
                except ValueError:
                    raise ValueError('Expense date must be a valid date (YYYY-MM-DD)')
            else:
                expense.expense_date = val

        expense.updated_at = datetime.utcnow()
        db.session.commit()
        return expense.to_dict()

    @staticmethod
    def delete_expense(user_id, expense_id):
        expense = Expense.query.filter_by(user_id=user_id, id=expense_id).first()
        if not expense:
            raise ValueError('Expense not found')
        db.session.delete(expense)
        db.session.commit()
        return True
