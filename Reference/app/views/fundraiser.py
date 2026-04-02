from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import current_user
from ..controllers.fsa_controller import FSAController
from ..controllers.category_controller import CategoryController
from ..utils.decorators import role_required

fundraiser_bp = Blueprint('fundraiser', __name__, url_prefix='/fundraiser')
fsa_controller = FSAController()
category_controller = CategoryController()


@fundraiser_bp.route('/dashboard')
@role_required('fundraiser')
def dashboard():
    stats = fsa_controller.get_fundraiser_stats(current_user.id)
    recent_fsas = fsa_controller.get_by_fundraiser(current_user.id, page=1, per_page=3)
    return render_template('fundraiser/dashboard.html', stats=stats, recent_fsas=recent_fsas)


@fundraiser_bp.route('/fsas')
@role_required('fundraiser')
def fsa_list():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', '')
    fsas = fsa_controller.get_by_fundraiser(current_user.id, status=status or None, page=page)
    return render_template('fundraiser/fsa_list.html', fsas=fsas, status_filter=status)


@fundraiser_bp.route('/fsas/create', methods=['GET', 'POST'])
@role_required('fundraiser')
def fsa_create():
    categories = category_controller.get_active_categories()

    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        goal_amount = request.form.get('goal_amount', 0)
        category_id = request.form.get('category_id', '')
        end_date_str = request.form.get('end_date', '')
        images = request.files.getlist('images')

        if not all([title, description, goal_amount, category_id]):
            flash('Please fill in all required fields.', 'danger')
            return render_template('fundraiser/fsa_create.html', categories=categories)

        try:
            goal_amount = float(goal_amount)
            if goal_amount <= 0:
                raise ValueError
        except ValueError:
            flash('Goal amount must be a positive number.', 'danger')
            return render_template('fundraiser/fsa_create.html', categories=categories)

        end_date = None
        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            except ValueError:
                pass

        fsa = fsa_controller.create_fsa(
            fundraiser_id=current_user.id,
            title=title,
            description=description,
            goal_amount=goal_amount,
            category_id=int(category_id),
            end_date=end_date,
            images=images
        )
        flash('Fundraising activity created successfully!', 'success')
        return redirect(url_for('fundraiser.fsa_detail', id=fsa.id))

    return render_template('fundraiser/fsa_create.html', categories=categories)


@fundraiser_bp.route('/fsas/<int:id>')
@role_required('fundraiser')
def fsa_detail(id):
    fsa = fsa_controller.get_by_id(id)
    if fsa.fundraiser_id != current_user.id:
        flash('You do not have access to this fundraising activity.', 'danger')
        return redirect(url_for('fundraiser.fsa_list'))
    donations = fsa.donations.order_by(db.text('created_at DESC')).limit(20).all()
    return render_template('fundraiser/fsa_detail.html', fsa=fsa, donations=donations)


@fundraiser_bp.route('/fsas/<int:id>/edit', methods=['GET', 'POST'])
@role_required('fundraiser')
def fsa_edit(id):
    fsa = fsa_controller.get_by_id(id)
    if fsa.fundraiser_id != current_user.id:
        flash('You do not have access to this fundraising activity.', 'danger')
        return redirect(url_for('fundraiser.fsa_list'))

    categories = category_controller.get_active_categories()

    if request.method == 'POST':
        kwargs = {
            'title': request.form.get('title', '').strip(),
            'description': request.form.get('description', '').strip(),
            'goal_amount': float(request.form.get('goal_amount', 0)),
            'category_id': int(request.form.get('category_id', fsa.category_id)),
        }
        end_date_str = request.form.get('end_date', '')
        if end_date_str:
            try:
                kwargs['end_date'] = datetime.strptime(end_date_str, '%Y-%m-%d')
            except ValueError:
                pass

        images = request.files.getlist('images')
        if images and images[0].filename:
            kwargs['images'] = images

        fsa, error = fsa_controller.update_fsa(id, current_user.id, **kwargs)
        if error:
            flash(error, 'danger')
        else:
            flash('Fundraising activity updated.', 'success')
        return redirect(url_for('fundraiser.fsa_detail', id=id))

    return render_template('fundraiser/fsa_edit.html', fsa=fsa, categories=categories)


@fundraiser_bp.route('/fsas/<int:id>/status', methods=['POST'])
@role_required('fundraiser')
def fsa_change_status(id):
    new_status = request.form.get('status', '')
    fsa, error = fsa_controller.change_status(id, new_status, current_user.id)
    if error:
        flash(error, 'danger')
    else:
        flash(f'Status changed to {new_status}.', 'success')
    return redirect(url_for('fundraiser.fsa_detail', id=id))


@fundraiser_bp.route('/fsas/<int:id>/delete', methods=['POST'])
@role_required('fundraiser')
def fsa_delete(id):
    fsa = fsa_controller.get_by_id(id)
    if fsa.fundraiser_id != current_user.id:
        flash('You do not have access to this fundraising activity.', 'danger')
        return redirect(url_for('fundraiser.fsa_list'))
    if fsa.status not in ('draft', 'cancelled'):
        flash('Only draft or cancelled activities can be deleted.', 'danger')
        return redirect(url_for('fundraiser.fsa_detail', id=id))
    fsa_controller.delete(id)
    flash('Fundraising activity deleted.', 'success')
    return redirect(url_for('fundraiser.fsa_list'))


@fundraiser_bp.route('/fsas/<int:id>/analytics')
@role_required('fundraiser')
def fsa_analytics(id):
    analytics = fsa_controller.get_analytics(id, current_user.id)
    if not analytics:
        flash('You do not have access to this fundraising activity.', 'danger')
        return redirect(url_for('fundraiser.fsa_list'))
    return render_template('fundraiser/fsa_analytics.html', analytics=analytics)


@fundraiser_bp.route('/history')
@role_required('fundraiser')
def fsa_history():
    page = request.args.get('page', 1, type=int)
    category_id = request.args.get('category_id', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')

    filters = {}
    if category_id:
        filters['category_id'] = category_id
    if date_from:
        try:
            filters['date_from'] = datetime.strptime(date_from, '%Y-%m-%d')
        except ValueError:
            pass
    if date_to:
        try:
            filters['date_to'] = datetime.strptime(date_to, '%Y-%m-%d')
        except ValueError:
            pass

    fsas = fsa_controller.get_completed_history(current_user.id, filters=filters or None, page=page)
    categories = category_controller.get_active_categories()
    return render_template('fundraiser/fsa_history.html', fsas=fsas, categories=categories,
                           category_id=category_id, date_from=date_from, date_to=date_to)


from ..extensions import db
