from datetime import datetime
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import current_user
from ..controllers.fsa_controller import FSAController
from ..controllers.donation_controller import DonationController
from ..controllers.favourite_controller import FavouriteController
from ..controllers.search_controller import SearchController
from ..controllers.category_controller import CategoryController
from ..utils.decorators import role_required

donee_bp = Blueprint('donee', __name__, url_prefix='/donee')
fsa_controller = FSAController()
donation_controller = DonationController()
favourite_controller = FavouriteController()
search_controller = SearchController()
category_controller = CategoryController()


@donee_bp.route('/dashboard')
@role_required('donee')
def dashboard():
    stats = donation_controller.get_donee_stats(current_user.id)
    recent_donations = donation_controller.get_donations_by_donee(current_user.id, page=1, per_page=5)
    favourites = favourite_controller.get_favourites(current_user.id, page=1, per_page=3)
    fav_count = favourite_controller.model.query.filter_by(donee_id=current_user.id).count()
    stats['favourites_count'] = fav_count
    return render_template('donee/dashboard.html', stats=stats,
                           recent_donations=recent_donations, favourites=favourites)


@donee_bp.route('/search')
@role_required('donee')
def search():
    page = request.args.get('page', 1, type=int)
    query = request.args.get('q', '')
    category_id = request.args.get('category_id', '')
    min_amount = request.args.get('min_amount', '')
    max_amount = request.args.get('max_amount', '')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')

    fsas = search_controller.search_fsas(
        query=query, category_id=category_id,
        min_amount=min_amount, max_amount=max_amount,
        sort_by=sort_by, sort_order=sort_order, page=page
    )
    filter_options = search_controller.get_filter_options()

    return render_template('donee/search.html', fsas=fsas, filter_options=filter_options,
                           query=query, category_id=category_id, min_amount=min_amount,
                           max_amount=max_amount, sort_by=sort_by, sort_order=sort_order)


@donee_bp.route('/fsa/<int:id>')
@role_required('donee')
def fsa_detail(id):
    fsa = fsa_controller.get_by_id(id)
    fsa_controller.increment_view(id)
    is_favourited = favourite_controller.is_favourited(current_user.id, id)
    donations = fsa.donations.order_by(db.text('created_at DESC')).limit(10).all()
    return render_template('donee/fsa_detail.html', fsa=fsa,
                           is_favourited=is_favourited, donations=donations)


@donee_bp.route('/fsa/<int:id>/donate', methods=['GET', 'POST'])
@role_required('donee')
def donate(id):
    fsa = fsa_controller.get_by_id(id)

    if request.method == 'POST':
        amount = request.form.get('amount', '')
        message = request.form.get('message', '').strip()
        is_anonymous = request.form.get('is_anonymous', False)

        donation, error = donation_controller.make_donation(
            donee_id=current_user.id,
            fsa_id=id,
            amount=amount,
            message=message,
            is_anonymous=bool(is_anonymous)
        )

        if donation:
            flash(f'Thank you for your donation of ${float(amount):,.2f}!', 'success')
            return redirect(url_for('donee.fsa_detail', id=id))
        else:
            flash(error, 'danger')

    return render_template('donee/donate.html', fsa=fsa)


@donee_bp.route('/fsa/<int:id>/favourite', methods=['POST'])
@role_required('donee')
def toggle_favourite(id):
    added = favourite_controller.toggle_favourite(current_user.id, id)
    if added:
        flash('Added to favourites!', 'success')
    else:
        flash('Removed from favourites.', 'info')
    return redirect(request.referrer or url_for('donee.fsa_detail', id=id))


@donee_bp.route('/favourites')
@role_required('donee')
def favourites():
    page = request.args.get('page', 1, type=int)
    favs = favourite_controller.get_favourites(current_user.id, page=page)
    return render_template('donee/favourites.html', favourites=favs)


@donee_bp.route('/donations')
@role_required('donee')
def donation_history():
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

    donations = donation_controller.get_donation_history(
        current_user.id, filters=filters or None, page=page)
    categories = category_controller.get_active_categories()
    return render_template('donee/donation_history.html', donations=donations,
                           categories=categories, category_id=category_id,
                           date_from=date_from, date_to=date_to)


from ..extensions import db
