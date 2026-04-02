from . import BaseController, db
from ..models.donation import Donation
from ..models.fundraising import FundraisingActivity


class DonationController(BaseController):
    model = Donation

    def make_donation(self, donee_id, fsa_id, amount, message=None, is_anonymous=False):
        fsa = FundraisingActivity.query.get_or_404(fsa_id)

        if fsa.status != 'active':
            return None, 'This fundraising activity is not currently accepting donations.'

        amount = float(amount)
        if amount <= 0:
            return None, 'Donation amount must be greater than zero.'

        donation = Donation(
            amount=amount,
            message=message,
            is_anonymous=is_anonymous,
            donee_id=donee_id,
            fsa_id=fsa_id
        )
        db.session.add(donation)

        # Update FSA current amount
        fsa.current_amount += amount

        # Auto-complete if goal reached
        if fsa.current_amount >= fsa.goal_amount:
            fsa.status = 'completed'

        db.session.commit()
        return donation, None

    def get_donations_by_donee(self, donee_id, page=1, per_page=12):
        return Donation.query.filter_by(donee_id=donee_id) \
            .order_by(Donation.created_at.desc()) \
            .paginate(page=page, per_page=per_page, error_out=False)

    def get_donations_by_fsa(self, fsa_id, page=1, per_page=20):
        return Donation.query.filter_by(fsa_id=fsa_id) \
            .order_by(Donation.created_at.desc()) \
            .paginate(page=page, per_page=per_page, error_out=False)

    def get_donation_history(self, donee_id, filters=None, page=1, per_page=12):
        query = Donation.query.filter_by(donee_id=donee_id)

        if filters:
            if filters.get('category_id'):
                query = query.join(FundraisingActivity).filter(
                    FundraisingActivity.category_id == int(filters['category_id']))
            if filters.get('date_from'):
                query = query.filter(Donation.created_at >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(Donation.created_at <= filters['date_to'])

        query = query.order_by(Donation.created_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)

    def get_donee_stats(self, donee_id):
        total_donated = db.session.query(db.func.sum(Donation.amount)) \
            .filter_by(donee_id=donee_id).scalar() or 0
        fsas_supported = db.session.query(db.func.count(db.distinct(Donation.fsa_id))) \
            .filter_by(donee_id=donee_id).scalar() or 0
        return {
            'total_donated': total_donated,
            'fsas_supported': fsas_supported,
            'total_donations': Donation.query.filter_by(donee_id=donee_id).count()
        }
