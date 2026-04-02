import re


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password):
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long.'
    if not re.search(r'[A-Za-z]', password):
        return False, 'Password must contain at least one letter.'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain at least one digit.'
    return True, ''


def validate_amount(amount):
    try:
        amount = float(amount)
        return amount > 0
    except (ValueError, TypeError):
        return False
