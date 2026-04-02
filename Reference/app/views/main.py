from flask import Blueprint, render_template, request
from ..controllers.fsa_controller import FSAController
from ..controllers.search_controller import SearchController
from ..controllers.category_controller import CategoryController

main_bp = Blueprint('main', __name__)
fsa_controller = FSAController()
search_controller = SearchController()
category_controller = CategoryController()


@main_bp.route('/')
def home():
    featured = fsa_controller.get_featured_fsas(limit=6)
    categories = category_controller.get_active_categories()
    return render_template('main/home.html', featured=featured, categories=categories)


@main_bp.route('/browse')
def browse():
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

    return render_template('main/browse.html', fsas=fsas, filter_options=filter_options,
                           query=query, category_id=category_id, min_amount=min_amount,
                           max_amount=max_amount, sort_by=sort_by, sort_order=sort_order)


@main_bp.route('/fsa/<int:id>')
def fsa_detail(id):
    fsa = fsa_controller.get_by_id(id)
    fsa_controller.increment_view(id)
    donations = fsa.donations.order_by(db.text('created_at DESC')).limit(10).all()
    return render_template('main/fsa_detail.html', fsa=fsa, donations=donations)


from ..extensions import db


@main_bp.route('/about')
def about():
    return render_template('main/about.html')
