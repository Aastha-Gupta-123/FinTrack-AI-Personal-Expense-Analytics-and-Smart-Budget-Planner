from flask import current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.notification_service import NotificationService


class NotificationController:

    @staticmethod
    @jwt_required()
    def list_notifications():
        user_id = int(get_jwt_identity())
        try:
            notifications = NotificationService.list_notifications(user_id)
            unread = NotificationService.unread_count(user_id)
            return current_app.response_success(
                'Notifications fetched',
                data={'notifications': notifications, 'unread_count': unread},
            )
        except Exception as exc:
            return current_app.response_error('Failed to fetch notifications', status_code=500,
                                               errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def mark_read():
        user_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}
        notification_id = data.get('notification_id')   # None = mark all
        try:
            NotificationService.mark_read(user_id, notification_id)
            return current_app.response_success('Marked as read')
        except Exception as exc:
            return current_app.response_error('Failed to update notification', status_code=500,
                                               errors={'detail': str(exc)})

    @staticmethod
    @jwt_required()
    def delete_notification(notification_id):
        user_id = int(get_jwt_identity())
        try:
            NotificationService.delete_notification(user_id, notification_id)
            return current_app.response_success('Notification deleted')
        except ValueError as exc:
            return current_app.response_error(str(exc), status_code=404)
        except Exception as exc:
            return current_app.response_error('Failed to delete notification', status_code=500,
                                               errors={'detail': str(exc)})
