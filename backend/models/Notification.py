from datetime import datetime
from app import db


class Notification(db.Model):
    """In-app notification model per user."""
    __tablename__ = 'notifications'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title      = db.Column(db.String(120), nullable=False)
    message    = db.Column(db.String(255), nullable=False)
    # 'unread' | 'read'
    status     = db.Column(db.String(20), default='unread', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'title':      self.title,
            'message':    self.message,
            'status':     self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
