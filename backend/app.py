import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from config import config_by_name
from utils.logger import setup_logging
from middlewares.error_handler import register_error_handlers
from utils.response import register_response_helpers
from utils.database import init_db

load_dotenv()

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

from routes.auth import bp as auth_bp
from routes.dashboard import bp as dashboard_bp
from routes.expense import bp as expense_bp
from routes.income import bp as income_bp
from routes.budget import bp as budget_bp
from routes.report import bp as report_bp
from routes.prediction import bp as prediction_bp
from routes.user import bp as user_bp
from routes.notification import bp as notification_bp
from routes.category import bp as category_bp
from models.User import User
from models.Category import Category
from models.Budget import Budget
from models.Notification import Notification


def create_app(config_name: str = 'default') -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    setup_logging(app)
    CORS(app, resources={r'/api/*': {'origins': app.config['CORS_ORIGINS']}})

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    register_error_handlers(app)
    register_response_helpers(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(income_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(category_bp)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'success': False, 'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({'success': False, 'message': 'Authorization token is required'}), 401

    init_db(app)

    return app


app = create_app()


@app.route('/')
def index():
    return jsonify({'message': 'FinTrack AI backend is running'})


@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    """Serve uploaded profile pictures."""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
