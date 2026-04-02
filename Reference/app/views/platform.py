from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import current_user
from ..controllers.category_controller import CategoryController
from ..controllers.report_controller import ReportController
from ..utils.decorators import role_required

platform_bp = Blueprint('platform', __name__, url_prefix='/platform')
category_controller = CategoryController()
report_controller = ReportController()


@platform_bp.route('/dashboard')
@role_required('platform')
def dashboard():
    stats = report_controller.get_dashboard_stats()
    category_stats = category_controller.get_category_stats()
    return render_template('platform/dashboard.html', stats=stats,
                           category_stats=category_stats)


@platform_bp.route('/categories')
@role_required('platform')
def category_list():
    categories = category_controller.get_category_stats()
    return render_template('platform/category_list.html', categories=categories)


@platform_bp.route('/categories/create', methods=['GET', 'POST'])
@role_required('platform')
def category_create():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        icon = request.form.get('icon', 'bi-heart').strip()

        if not name:
            flash('Category name is required.', 'danger')
            return render_template('platform/category_form.html')

        category, error = category_controller.create_category(name, description, icon)
        if category:
            flash(f'Category "{name}" created successfully.', 'success')
            return redirect(url_for('platform.category_list'))
        else:
            flash(error, 'danger')

    return render_template('platform/category_form.html')


@platform_bp.route('/categories/<int:id>/edit', methods=['GET', 'POST'])
@role_required('platform')
def category_edit(id):
    category = category_controller.get_by_id(id)

    if request.method == 'POST':
        kwargs = {
            'name': request.form.get('name', '').strip(),
            'description': request.form.get('description', '').strip(),
            'icon': request.form.get('icon', 'bi-heart').strip(),
        }
        updated, error = category_controller.update_category(id, **kwargs)
        if error:
            flash(error, 'danger')
        else:
            flash('Category updated successfully.', 'success')
        return redirect(url_for('platform.category_list'))

    return render_template('platform/category_form.html', category=category)


@platform_bp.route('/categories/<int:id>/toggle', methods=['POST'])
@role_required('platform')
def category_toggle(id):
    category = category_controller.toggle_active(id)
    status = 'activated' if category.is_active else 'deactivated'
    flash(f'Category "{category.name}" {status}.', 'success')
    return redirect(url_for('platform.category_list'))


@platform_bp.route('/reports')
@role_required('platform')
def reports():
    page = request.args.get('page', 1, type=int)
    history = report_controller.get_reports_history(page=page)
    return render_template('platform/reports.html', reports=history)


@platform_bp.route('/reports/generate', methods=['POST'])
@role_required('platform')
def generate_report():
    report_type = request.form.get('report_type', 'daily')
    report, error = report_controller.generate_report(report_type, current_user.id)
    if report:
        flash(f'{report_type.title()} report generated successfully.', 'success')
        return redirect(url_for('platform.report_view', id=report.id))
    else:
        flash(error, 'danger')
        return redirect(url_for('platform.reports'))


@platform_bp.route('/reports/<int:id>')
@role_required('platform')
def report_view(id):
    report = report_controller.get_by_id(id)
    report_data = report.get_data()
    return render_template('platform/report_view.html', report=report, report_data=report_data)
