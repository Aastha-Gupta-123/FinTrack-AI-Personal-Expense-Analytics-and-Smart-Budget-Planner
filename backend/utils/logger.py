import logging
import os
from logging.handlers import RotatingFileHandler


def setup_logging(app):
    """Configure application logging."""
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)

    handler = RotatingFileHandler(os.path.join(log_dir, 'app.log'), maxBytes=5 * 1024 * 1024, backupCount=3)
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s'))

    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    app.logger.propagate = False
