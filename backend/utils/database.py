from flask_sqlalchemy import SQLAlchemy


def init_db(app, db: SQLAlchemy | None = None):
    """Initialize SQLAlchemy with the Flask app."""
    if db is None:
        from app import db as app_db
        db = app_db

    with app.app_context():
        try:
            db.create_all()
        except Exception:
            app.logger.exception('Database initialization failed. Check the MySQL credentials and database setup.')
            raise
