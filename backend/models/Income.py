from datetime import datetime
from app import db


class Income(db.Model):
    """Income model for authenticated users."""
    __tablename__ = 'incomes'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    source      = db.Column(db.String(80), nullable=False)
    title       = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amount      = db.Column(db.Float, nullable=False)
    income_date = db.Column(db.Date, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='incomes')

    # ── Indexes for common query patterns ────────────────────────────────────
    __table_args__ = (
        db.Index('ix_incomes_user_date', 'user_id', 'income_date'),
        db.Index('ix_incomes_user_source', 'user_id', 'source'),
    )

    def to_dict(self):
        return {
            'id':          self.id,
            'user_id':     self.user_id,
            'source':      self.source or 'General',
            'title':       self.title,
            'description': self.description or '',
            'amount':      float(self.amount),
            'income_date': self.income_date.isoformat() if self.income_date else None,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
            'updated_at':  self.updated_at.isoformat() if self.updated_at else None,
        }
