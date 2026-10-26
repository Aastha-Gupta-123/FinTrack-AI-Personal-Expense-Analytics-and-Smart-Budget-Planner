from datetime import datetime
from app import db


class Expense(db.Model):
    """Expense model for authenticated users."""
    __tablename__ = 'expenses'

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    category_id    = db.Column(db.Integer, nullable=True)
    title          = db.Column(db.String(120), nullable=False)
    description    = db.Column(db.Text, nullable=True)
    amount         = db.Column(db.Float, nullable=False)
    category_name  = db.Column(db.String(80), nullable=True)
    payment_method = db.Column(db.String(50), nullable=True)
    expense_date   = db.Column(db.Date, nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='expenses')

    # ── Indexes for common query patterns ────────────────────────────────────
    __table_args__ = (
        db.Index('ix_expenses_user_date', 'user_id', 'expense_date'),
        db.Index('ix_expenses_user_category', 'user_id', 'category_name'),
    )

    def to_dict(self):
        return {
            'id':             self.id,
            'user_id':        self.user_id,
            'category_id':    self.category_id,
            'title':          self.title,
            'description':    self.description or '',
            'amount':         float(self.amount),
            'category_name':  self.category_name or 'General',
            'payment_method': self.payment_method or 'Cash',
            'expense_date':   self.expense_date.isoformat() if self.expense_date else None,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
            'updated_at':     self.updated_at.isoformat() if self.updated_at else None,
        }
