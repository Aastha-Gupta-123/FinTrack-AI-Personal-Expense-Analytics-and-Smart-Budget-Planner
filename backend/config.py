import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Core ──────────────────────────────────────────────────────────────────
    SECRET_KEY = os.getenv('SECRET_KEY', 'fintrack-dev-secret-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'fintrack-jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # ── Database ──────────────────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///fintrack.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Enable connection pooling optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,       # check connection health before use
        'pool_recycle': 300,         # recycle connections every 5 minutes
    }

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Supports multiple origins via comma-separated env var
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
        if origin.strip()
    ]

    # ── File uploads ──────────────────────────────────────────────────────────
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16 MB

    # ── JSON ──────────────────────────────────────────────────────────────────
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    # Warn loudly if secrets are not overridden (evaluated at runtime, not import time)
    @classmethod
    def init_app(cls, app):
        if cls.SECRET_KEY == 'fintrack-dev-secret-change-in-production':
            import warnings
            warnings.warn('SECRET_KEY is using the insecure default. Set SECRET_KEY in your environment.', stacklevel=2)
        if cls.JWT_SECRET_KEY == 'fintrack-jwt-secret-change-in-production':
            import warnings
            warnings.warn('JWT_SECRET_KEY is using the insecure default. Set JWT_SECRET_KEY in your environment.', stacklevel=2)


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig,
}
