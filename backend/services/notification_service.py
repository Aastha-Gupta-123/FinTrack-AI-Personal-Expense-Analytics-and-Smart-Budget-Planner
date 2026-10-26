"""Notification service — create, list, mark-read, delete notifications."""
from datetime import datetime
from app import db
from models.Notification import Notification


class NotificationService:

    @staticmethod
    def push(user_id: int, title: str, message: str) -> Notification:
        """Create and persist a new notification. Called by other services."""
        notif = Notification(user_id=user_id, title=title, message=message)
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def list_notifications(user_id: int) -> list:
        notifs = (
            Notification.query
            .filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .limit(50)
            .all()
        )
        return [n.to_dict() for n in notifs]

    @staticmethod
    def unread_count(user_id: int) -> int:
        return Notification.query.filter_by(user_id=user_id, status='unread').count()

    @staticmethod
    def mark_read(user_id: int, notification_id: int | None = None):
        """Mark one notification (or all) as read."""
        q = Notification.query.filter_by(user_id=user_id)
        if notification_id:
            q = q.filter_by(id=notification_id)
        q.update({'status': 'read'})
        db.session.commit()

    @staticmethod
    def delete_notification(user_id: int, notification_id: int):
        notif = Notification.query.filter_by(user_id=user_id, id=notification_id).first()
        if not notif:
            raise ValueError('Notification not found')
        db.session.delete(notif)
        db.session.commit()
