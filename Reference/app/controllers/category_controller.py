from . import BaseController, db
from ..models.category import Category
from ..models.fundraising import FundraisingActivity


class CategoryController(BaseController):
    model = Category

    def get_active_categories(self):
        return Category.query.filter_by(is_active=True).order_by(Category.name).all()

    def create_category(self, name, description=None, icon='bi-heart'):
        if Category.query.filter_by(name=name).first():
            return None, 'Category with this name already exists.'
        category = Category(name=name, description=description, icon=icon)
        db.session.add(category)
        db.session.commit()
        return category, None

    def update_category(self, category_id, **kwargs):
        category = self.get_by_id(category_id)
        if 'name' in kwargs:
            existing = Category.query.filter(
                Category.name == kwargs['name'], Category.id != category_id).first()
            if existing:
                return None, 'Category with this name already exists.'
        for key, value in kwargs.items():
            if hasattr(category, key) and key != 'id':
                setattr(category, key, value)
        db.session.commit()
        return category, None

    def toggle_active(self, category_id):
        category = self.get_by_id(category_id)
        category.is_active = not category.is_active
        db.session.commit()
        return category

    def get_category_stats(self):
        categories = Category.query.all()
        stats = []
        for cat in categories:
            fsa_count = cat.fundraising_activities.count()
            total_raised = db.session.query(db.func.sum(FundraisingActivity.current_amount)) \
                .filter_by(category_id=cat.id).scalar() or 0
            stats.append({
                'category': cat,
                'fsa_count': fsa_count,
                'total_raised': total_raised
            })
        return stats
