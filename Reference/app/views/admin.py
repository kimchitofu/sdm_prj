from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import current_user
from ..controllers.user_controller import UserController
from ..utils.decorators import role_required
from ..utils.validators import validate_email, validate_password

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
user_controller = UserController()


@admin_bp.route('/dashboard')
@role_required('admin')
def dashboard():
    stats = user_controller.get_user_stats()
    from ..models.user import User
    recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
    return render_template('admin/dashboard.html', stats=stats, recent_users=recent_users)


@admin_bp.route('/users')
@role_required('admin')
def user_list():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('q', '')
    role_filter = request.args.get('role', '')

    filters = {}
    if role_filter:
        filters['role'] = role_filter

    users = user_controller.search(search, filters=filters, page=page)
    return render_template('admin/user_list.html', users=users, search=search,
                           role_filter=role_filter)


@admin_bp.route('/users/create', methods=['GET', 'POST'])
@role_required('admin')
def user_create():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        role = request.form.get('role', 'donee')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        phone = request.form.get('phone', '').strip()

        if not all([email, username, password, first_name, last_name, role]):
            flash('All required fields must be filled.', 'danger')
            return render_template('admin/user_create.html')

        if not validate_email(email):
            flash('Please enter a valid email address.', 'danger')
            return render_template('admin/user_create.html')

        valid, msg = validate_password(password)
        if not valid:
            flash(msg, 'danger')
            return render_template('admin/user_create.html')

        user, error = user_controller.register(
            email=email, username=username, password=password,
            role=role, first_name=first_name, last_name=last_name, phone=phone
        )

        if user:
            flash(f'User {username} created successfully.', 'success')
            return redirect(url_for('admin.user_list'))
        else:
            flash(error, 'danger')

    return render_template('admin/user_create.html')


@admin_bp.route('/users/<int:id>')
@role_required('admin')
def user_detail(id):
    user = user_controller.get_by_id(id)
    return render_template('admin/user_detail.html', user=user)


@admin_bp.route('/users/<int:id>/update', methods=['POST'])
@role_required('admin')
def user_update(id):
    kwargs = {
        'first_name': request.form.get('first_name', '').strip(),
        'last_name': request.form.get('last_name', '').strip(),
        'email': request.form.get('email', '').strip(),
        'phone': request.form.get('phone', '').strip(),
        'role': request.form.get('role', ''),
    }
    kwargs = {k: v for k, v in kwargs.items() if v}
    user_controller.update(id, **kwargs)
    flash('User updated successfully.', 'success')
    return redirect(url_for('admin.user_detail', id=id))


@admin_bp.route('/users/<int:id>/suspend', methods=['POST'])
@role_required('admin')
def user_suspend(id):
    user_controller.suspend_user(id)
    flash('User account suspended.', 'warning')
    return redirect(url_for('admin.user_detail', id=id))


@admin_bp.route('/users/<int:id>/reactivate', methods=['POST'])
@role_required('admin')
def user_reactivate(id):
    user_controller.reactivate_user(id)
    flash('User account reactivated.', 'success')
    return redirect(url_for('admin.user_detail', id=id))
