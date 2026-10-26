from datetime import date as date_type, datetime
from app import db
from models.Income import Income
from utils.validators import validate_required_fields


class IncomeService:
    """Business logic for income CRUD and filtering."""

    @staticmethod
    def list_incomes(user_id, page=1, per_page=10, search='', source='', date_filter='', sort='income_date'):
        query = Income.query.filter_by(user_id=user_id)
        if search:
            query = query.filter(Income.title.ilike(f'%{search.lower()}%'))
        if source:
            query = query.filter(Income.source == source)
        if date_filter:
            try:
                parsed = date_type.fromisoformat(date_filter)
                query = query.filter(Income.income_date == parsed)
            except ValueError:
                raise ValueError('Income date must be a valid date')
        if sort == 'amount_desc':
            query = query.order_by(Income.amount.desc())
        elif sort == 'amount_asc':
            query = query.order_by(Income.amount.asc())
        else:
            query = query.order_by(Income.income_date.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return [i.to_dict() for i in pagination.items], pagination.total

    @staticmethod
    def create_income(user_id, data):
        missing = validate_required_fields(data, ['title', 'amount', 'source', 'income_date'])
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        amount = float(data['amount'])
        if amount <= 0:
            raise ValueError('Amount must be greater than zero')

        income_date = data['income_date']
        if isinstance(income_date, str):
            try:
                income_date = date_type.fromisoformat(income_date)
            except ValueError:
                raise ValueError('Income date must be a valid date (YYYY-MM-DD)')

        income = Income(
            user_id=user_id,
            title=str(data.get('title', '')).strip(),
            description=str(data.get('description', '')).strip(),
            amount=amount,
            source=str(data.get('source', '')).strip(),
            income_date=income_date,
        )
        db.session.add(income)
        db.session.commit()
        return income.to_dict()

    @staticmethod
    def get_income(user_id, income_id):
        income = Income.query.filter_by(user_id=user_id, id=income_id).first()
        if not income:
            raise ValueError('Income not found')
        return income.to_dict()

    @staticmethod
    def update_income(user_id, income_id, data):
        income = Income.query.filter_by(user_id=user_id, id=income_id).first()
        if not income:
            raise ValueError('Income not found')

        if 'title' in data:
            if not str(data['title']).strip():
                raise ValueError('Title is required')
            income.title = str(data['title']).strip()
        if 'amount' in data:
            amount = float(data['amount'])
            if amount <= 0:
                raise ValueError('Amount must be greater than zero')
            income.amount = amount
        if 'source' in data:
            if not str(data['source']).strip():
                raise ValueError('Source is required')
            income.source = str(data['source']).strip()
        if 'description' in data:
            income.description = str(data['description']).strip()
        if 'income_date' in data:
            val = data['income_date']
            if isinstance(val, str):
                try:
                    income.income_date = date_type.fromisoformat(val)
                except ValueError:
                    raise ValueError('Income date must be a valid date (YYYY-MM-DD)')
            else:
                income.income_date = val

        income.updated_at = datetime.utcnow()
        db.session.commit()
        return income.to_dict()

    @staticmethod
    def delete_income(user_id, income_id):
        income = Income.query.filter_by(user_id=user_id, id=income_id).first()
        if not income:
            raise ValueError('Income not found')
        db.session.delete(income)
        db.session.commit()
