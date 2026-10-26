from flask import Blueprint
from controllers.auth_controller import AuthController

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

bp.add_url_rule('/register', view_func=AuthController.register, methods=['POST'])
bp.add_url_rule('/login', view_func=AuthController.login, methods=['POST'])
bp.add_url_rule('/logout', view_func=AuthController.logout, methods=['POST'])
bp.add_url_rule('/profile', view_func=AuthController.profile, methods=['GET'])
