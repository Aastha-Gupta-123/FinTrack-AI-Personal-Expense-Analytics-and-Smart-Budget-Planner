"""
Development entry point.
For production, use Gunicorn with: gunicorn --config gunicorn.conf.py "app:create_app()"
"""
from app import create_app

if __name__ == '__main__':
    application = create_app()
    application.run(host='0.0.0.0', port=5000, debug=True)
