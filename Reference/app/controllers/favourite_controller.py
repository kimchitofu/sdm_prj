from . import BaseController, db
from ..models.favourite import Favourite
from ..models.fundraising import FundraisingActivity


class FavouriteController(BaseController):
    model = Favourite

    def add_favourite(self, donee_id, fsa_id):
        existing = Favourite.query.filter_by(donee_id=donee_id, fsa_id=fsa_id).first()
        if existing:
            return existing, 'Already in favourites.'

        favourite = Favourite(donee_id=donee_id, fsa_id=fsa_id)
        db.session.add(favourite)

        # Increment shortlist count
        fsa = FundraisingActivity.query.get(fsa_id)
        if fsa:
            fsa.shortlist_count += 1

        db.session.commit()
        return favourite, None

    def remove_favourite(self, donee_id, fsa_id):
        favourite = Favourite.query.filter_by(donee_id=donee_id, fsa_id=fsa_id).first()
        if not favourite:
            return False

        db.session.delete(favourite)

        # Decrement shortlist count
        fsa = FundraisingActivity.query.get(fsa_id)
        if fsa and fsa.shortlist_count > 0:
            fsa.shortlist_count -= 1

        db.session.commit()
        return True

    def toggle_favourite(self, donee_id, fsa_id):
        existing = Favourite.query.filter_by(donee_id=donee_id, fsa_id=fsa_id).first()
        if existing:
            self.remove_favourite(donee_id, fsa_id)
            return False  # Removed
        else:
            self.add_favourite(donee_id, fsa_id)
            return True  # Added

    def get_favourites(self, donee_id, page=1, per_page=12):
        return Favourite.query.filter_by(donee_id=donee_id) \
            .order_by(Favourite.created_at.desc()) \
            .paginate(page=page, per_page=per_page, error_out=False)

    def is_favourited(self, donee_id, fsa_id):
        return Favourite.query.filter_by(donee_id=donee_id, fsa_id=fsa_id).first() is not None
