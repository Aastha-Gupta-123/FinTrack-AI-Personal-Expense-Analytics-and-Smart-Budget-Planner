import re
from flask_jwt_extended import create_access_token
from utils.security import hash_password, verify_password
from utils.validators import validate_required_fields


def _get_db():
    from app import db
    return db


def _get_user_model():
    from models.User import User
    return User


class AuthService:
    """Service layer for authentication operations."""

    @staticmethod
    def register_user(data):
        required_fields = ['full_name', 'email', 'phone', 'password', 'confirm_password']
        missing = validate_required_fields(data, required_fields)
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        full_name = str(data.get('full_name', '')).strip()
        email = str(data.get('email', '')).strip().lower()
        phone = str(data.get('phone', '')).strip()
        password = str(data.get('password', ''))
        confirm_password = str(data.get('confirm_password', ''))

        if not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email):
            raise ValueError('Please provide a valid email address')

        if not re.fullmatch(r'^\+?[0-9\-\s]{7,15}$', phone):
            raise ValueError('Please provide a valid phone number')

        if len(password) < 8:
            raise ValueError('Password must be at least 8 characters long')

        if password != confirm_password:
            raise ValueError('Password confirmation does not match')

        User = _get_user_model()
        db = _get_db()

        if User.query.filter_by(email=email).first():
            raise ValueError('An account with this email already exists')

        user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            password=hash_password(password),
        )
        db.session.add(user)
        db.session.commit()

        # Seed default categories for the new user
        from services.category_service import CategoryService
        CategoryService.ensure_defaults(user.id)

        return user

    @staticmethod
    def login_user(data):
        required_fields = ['email', 'password']
        missing = validate_required_fields(data, required_fields)
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        email = str(data.get('email', '')).strip().lower()
        password = str(data.get('password', ''))

        User = _get_user_model()
        user = User.query.filter_by(email=email).first()
        if not user or not verify_password(password, user.password):
            raise ValueError('Invalid email or password')

        access_token = create_access_token(identity=str(user.id))
        return {
            'access_token': access_token,
            'user': user.to_dict(),
        }

    @staticmethod
    def get_profile(user_id):
        User = _get_user_model()
        db = _get_db()
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')
        return user
