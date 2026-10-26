from flask_bcrypt import generate_password_hash, check_password_hash


def hash_password(password: str) -> str:
    """Hash a password for secure storage."""
    return generate_password_hash(password).decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored hash."""
    return check_password_hash(hashed_password, password)
