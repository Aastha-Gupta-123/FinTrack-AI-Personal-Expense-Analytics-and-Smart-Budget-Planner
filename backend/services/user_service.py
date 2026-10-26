"""User service — profile management and password change."""
import os
import re
from datetime import datetime
from werkzeug.utils import secure_filename
from app import db
from models.User import User
from models.Expense import Expense
from models.Income import Income
from utils.security import hash_password, verify_password
from services.notification_service import NotificationService
from sqlalchemy import func

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def _allowed(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class UserService:

    @staticmethod
    def get_profile(user_id: int) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')

        # Use aggregate queries for efficiency instead of loading all records
        total_income   = db.session.query(func.sum(Income.amount)).filter_by(user_id=user_id).scalar() or 0.0
        total_expenses = db.session.query(func.sum(Expense.amount)).filter_by(user_id=user_id).scalar() or 0.0
        total_savings  = total_income - total_expenses

        profile = user.to_dict()
        profile['total_income']   = round(float(total_income), 2)
        profile['total_expenses'] = round(float(total_expenses), 2)
        profile['total_savings']  = round(float(total_savings), 2)
        return profile

    @staticmethod
    def update_profile(user_id: int, data: dict) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')

        if 'full_name' in data:
            name = str(data['full_name']).strip()
            if not name:
                raise ValueError('Full name is required')
            user.full_name = name

        if 'phone' in data:
            phone = str(data['phone']).strip()
            if not re.fullmatch(r'^\+?[0-9\-\s]{7,15}$', phone):
                raise ValueError('Please provide a valid phone number')
            user.phone = phone

        if 'email' in data:
            email = str(data['email']).strip().lower()
            if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
                raise ValueError('Please provide a valid email address')
            existing = User.query.filter_by(email=email).first()
            if existing and existing.id != user_id:
                raise ValueError('Email already in use')
            user.email = email

        user.updated_at = datetime.utcnow()
        db.session.commit()

        NotificationService.push(
            user_id, 'Profile Updated',
            'Your profile information has been updated successfully.',
        )
        return user.to_dict()

    @staticmethod
    def upload_profile_picture(user_id: int, file, upload_folder: str) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')
        if not file or not _allowed(file.filename):
            raise ValueError('Invalid file type. Allowed: png, jpg, jpeg, gif, webp')

        # Remove old picture
        if user.profile_image:
            old_path = os.path.join(upload_folder, user.profile_image)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except OSError:
                    pass  # Non-fatal if file already gone

        filename = f"avatar_{user_id}_{int(datetime.utcnow().timestamp())}.{file.filename.rsplit('.', 1)[1].lower()}"
        filename = secure_filename(filename)
        os.makedirs(upload_folder, exist_ok=True)
        file.save(os.path.join(upload_folder, filename))

        user.profile_image = filename
        user.updated_at = datetime.utcnow()
        db.session.commit()

        NotificationService.push(user_id, 'Profile Picture Updated', 'Your profile picture has been changed.')
        return user.to_dict()

    @staticmethod
    def delete_profile_picture(user_id: int, upload_folder: str) -> dict:
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')
        if user.profile_image:
            path = os.path.join(upload_folder, user.profile_image)
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
            user.profile_image = None
            user.updated_at = datetime.utcnow()
            db.session.commit()
        return user.to_dict()

    @staticmethod
    def change_password(user_id: int, data: dict):
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError('User not found')

        current_pw  = str(data.get('current_password', ''))
        new_pw      = str(data.get('new_password', ''))
        confirm_pw  = str(data.get('confirm_password', ''))

        if not current_pw or not new_pw or not confirm_pw:
            raise ValueError('All password fields are required')
        if not verify_password(current_pw, user.password):
            raise ValueError('Current password is incorrect')
        if len(new_pw) < 8:
            raise ValueError('New password must be at least 8 characters')
        if new_pw != confirm_pw:
            raise ValueError('Passwords do not match')
        if new_pw == current_pw:
            raise ValueError('New password must be different from the current password')

        user.password   = hash_password(new_pw)
        user.updated_at = datetime.utcnow()
        db.session.commit()

        NotificationService.push(user_id, 'Password Changed', 'Your account password was changed successfully.')
