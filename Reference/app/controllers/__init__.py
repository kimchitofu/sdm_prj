from ..extensions import db


class BaseController:
    """Abstract base controller providing common CRUD patterns."""

    model = None

    def get_by_id(self, record_id):
        return self.model.query.get_or_404(record_id)

    def get_all(self, page=1, per_page=12):
        return self.model.query.paginate(page=page, per_page=per_page, error_out=False)

    def create(self, **kwargs):
        instance = self.model(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance

    def update(self, record_id, **kwargs):
        instance = self.get_by_id(record_id)
        for key, value in kwargs.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        db.session.commit()
        return instance

    def delete(self, record_id):
        instance = self.get_by_id(record_id)
        db.session.delete(instance)
        db.session.commit()

    def search(self, query_string, filters=None, page=1, per_page=12):
        raise NotImplementedError
