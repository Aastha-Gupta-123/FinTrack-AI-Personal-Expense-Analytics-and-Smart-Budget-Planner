from flask import Blueprint
from controllers.user_controller import UserController

bp = Blueprint('user', __name__, url_prefix='/api/profile')

bp.route('',                  methods=['GET']   )(UserController.get_profile)
bp.route('',                  methods=['PUT']   )(UserController.update_profile)
bp.route('/picture',          methods=['POST']  )(UserController.upload_picture)
bp.route('/picture',          methods=['DELETE'])(UserController.delete_picture)
bp.route('/change-password',  methods=['PUT']   )(UserController.change_password)
