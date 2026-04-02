from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from ..controllers.user_controller import UserController
from ..utils.validators import validate_email, validate_password
from ..utils.helpers import save_uploaded_image

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
user_controller = UserController()


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)

        user, error = user_controller.authenticate(email, password)
        if user:
            login_user(user, remember=bool(remember))
            flash('Welcome back!', 'success')
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            # Redirect based on role
            role_dashboards = {
                'admin': 'admin.dashboard',
                'fundraiser': 'fundraiser.dashboard',
                'donee': 'donee.dashboard',
                'platform': 'platform.dashboard'
            }
            return redirect(url_for(role_dashboards.get(user.role, 'main.home')))
        else:
            flash(error, 'danger')

    return render_template('auth/login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        role = request.form.get('role', 'donee')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        phone = request.form.get('phone', '').strip()

        # Validation
        if not all([email, username, password, first_name, last_name]):
            flash('All required fields must be filled.', 'danger')
            return render_template('auth/register.html')

        if not validate_email(email):
            flash('Please enter a valid email address.', 'danger')
            return render_template('auth/register.html')

        valid, msg = validate_password(password)
        if not valid:
            flash(msg, 'danger')
            return render_template('auth/register.html')

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('auth/register.html')

        if role not in ('fundraiser', 'donee'):
            flash('Invalid role selected.', 'danger')
            return render_template('auth/register.html')

        user, error = user_controller.register(
            email=email, username=username, password=password,
            role=role, first_name=first_name, last_name=last_name, phone=phone
        )

        if user:
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('auth.login'))
        else:
            flash(error, 'danger')

    return render_template('auth/register.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.home'))


@auth_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        kwargs = {
            'first_name': request.form.get('first_name', '').strip(),
            'last_name': request.form.get('last_name', '').strip(),
            'phone': request.form.get('phone', '').strip(),
            'bio': request.form.get('bio', '').strip(),
        }

        # Handle avatar upload
        avatar = request.files.get('profile_image')
        if avatar and avatar.filename:
            filepath = save_uploaded_image(avatar, subfolder='avatars')
            if filepath:
                kwargs['profile_image'] = filepath

        user_controller.update_profile(current_user.id, **kwargs)
        flash('Profile updated successfully.', 'success')
        return redirect(url_for('auth.profile'))

    return render_template('auth/profile.html')
