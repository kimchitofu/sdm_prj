from functools import wraps
from flask import abort, flash, redirect, url_for
from flask_login import current_user, login_required


def role_required(*roles):
    """Decorator that checks if the current user has one of the specified roles."""
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            if current_user.role not in roles:
                abort(403)
            if current_user.is_suspended:
                flash('Your account has been suspended. Please contact an administrator.', 'danger')
                return redirect(url_for('auth.logout'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator
