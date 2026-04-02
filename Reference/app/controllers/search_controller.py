from ..extensions import db
from ..models.fundraising import FundraisingActivity
from ..models.category import Category


class SearchController:
    """Unified search across FSAs."""

    def search_fsas(self, query=None, category_id=None, min_amount=None,
                    max_amount=None, sort_by='created_at', sort_order='desc',
                    page=1, per_page=12):
        q = FundraisingActivity.query.filter_by(status='active')

        if query:
            search = f'%{query}%'
            q = q.filter(
                db.or_(
                    FundraisingActivity.title.ilike(search),
                    FundraisingActivity.description.ilike(search)
                )
            )

        if category_id:
            q = q.filter_by(category_id=int(category_id))
        if min_amount:
            q = q.filter(FundraisingActivity.goal_amount >= float(min_amount))
        if max_amount:
            q = q.filter(FundraisingActivity.goal_amount <= float(max_amount))

        # Sorting
        sort_options = {
            'created_at': FundraisingActivity.created_at,
            'goal_amount': FundraisingActivity.goal_amount,
            'current_amount': FundraisingActivity.current_amount,
            'view_count': FundraisingActivity.view_count,
        }
        sort_col = sort_options.get(sort_by, FundraisingActivity.created_at)
        if sort_order == 'asc':
            q = q.order_by(sort_col.asc())
        else:
            q = q.order_by(sort_col.desc())

        return q.paginate(page=page, per_page=per_page, error_out=False)

    def get_filter_options(self):
        categories = Category.query.filter_by(is_active=True).order_by(Category.name).all()
        return {
            'categories': categories
        }
