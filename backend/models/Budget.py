from datetime import datetime
from app import db


class Budget(db.Model):
    """Monthly budget model per user."""
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)          # 1–12
    year = db.Column(db.Integer, nullable=False)
    monthly_budget = db.Column(db.Float, nullable=False)
    spent_amount = db.Column(db.Float, default=0.0, nullable=False)
    remaining_amount = db.Column(db.Float, default=0.0, nullable=False)
    budget_status = db.Column(db.String(20), default='Safe', nullable=False)  # Safe | Warning | Overspent
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='budgets')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'month', 'year', name='uq_user_month_year'),
    )

    def to_dict(self):
        usage_pct = round((self.spent_amount / self.monthly_budget) * 100, 2) if self.monthly_budget else 0
        return {
            'id': self.id,
            'user_id': self.user_id,
            'month': self.month,
            'year': self.year,
            'monthly_budget': float(self.monthly_budget),
            'spent_amount': float(self.spent_amount),
            'remaining_amount': float(self.remaining_amount),
            'budget_status': self.budget_status,
            'usage_percentage': usage_pct,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
