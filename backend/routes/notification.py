from flask import Blueprint
from controllers.notification_controller import NotificationController

bp = Blueprint('notification', __name__, url_prefix='/api/notifications')

bp.route('',                          methods=['GET']   )(NotificationController.list_notifications)
bp.route('/read',                     methods=['POST']  )(NotificationController.mark_read)
bp.route('/<int:notification_id>',    methods=['DELETE'])(NotificationController.delete_notification)
