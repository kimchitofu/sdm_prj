from datetime import datetime
from . import BaseController, db
from ..models.fundraising import FundraisingActivity, FSAImage
from ..utils.helpers import save_uploaded_image, delete_uploaded_image


class FSAController(BaseController):
    model = FundraisingActivity

    def create_fsa(self, fundraiser_id, title, description, goal_amount, category_id,
                   start_date=None, end_date=None, images=None):
        fsa = FundraisingActivity(
            title=title,
            description=description,
            goal_amount=float(goal_amount),
            category_id=category_id,
            fundraiser_id=fundraiser_id,
            start_date=start_date,
            end_date=end_date,
            status='draft'
        )
        db.session.add(fsa)
        db.session.flush()

        # Handle image uploads
        if images:
            for i, img_file in enumerate(images):
                if img_file and img_file.filename:
                    filepath = save_uploaded_image(img_file)
                    if filepath:
                        fsa_image = FSAImage(
                            fsa_id=fsa.id,
                            filename=filepath,
                            is_primary=(i == 0)
                        )
                        db.session.add(fsa_image)

        db.session.commit()
        return fsa

    def update_fsa(self, fsa_id, fundraiser_id, **kwargs):
        fsa = self.get_by_id(fsa_id)
        if fsa.fundraiser_id != fundraiser_id:
            return None, 'You do not own this fundraising activity.'

        images = kwargs.pop('images', None)
        for key, value in kwargs.items():
            if hasattr(fsa, key) and key not in ('id', 'fundraiser_id', 'current_amount'):
                setattr(fsa, key, value)

        if images:
            for img_file in images:
                if img_file and img_file.filename:
                    filepath = save_uploaded_image(img_file)
                    if filepath:
                        fsa_image = FSAImage(fsa_id=fsa.id, filename=filepath)
                        db.session.add(fsa_image)

        db.session.commit()
        return fsa, None

    def change_status(self, fsa_id, new_status, fundraiser_id):
        fsa = self.get_by_id(fsa_id)
        if fsa.fundraiser_id != fundraiser_id:
            return None, 'You do not own this fundraising activity.'

        allowed_transitions = {
            'draft': ['active', 'cancelled'],
            'active': ['paused', 'completed'],
            'paused': ['active', 'completed'],
        }

        if new_status not in allowed_transitions.get(fsa.status, []):
            return None, f'Cannot change status from {fsa.status} to {new_status}.'

        fsa.status = new_status
        if new_status == 'active' and not fsa.start_date:
            fsa.start_date = datetime.utcnow()
        db.session.commit()
        return fsa, None

    def increment_view(self, fsa_id):
        fsa = FundraisingActivity.query.get(fsa_id)
        if fsa:
            fsa.view_count += 1
            db.session.commit()

    def get_by_fundraiser(self, fundraiser_id, status=None, page=1, per_page=12):
        query = FundraisingActivity.query.filter_by(fundraiser_id=fundraiser_id)
        if status:
            query = query.filter_by(status=status)
        query = query.order_by(FundraisingActivity.created_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)

    def get_active_fsas(self, page=1, per_page=12):
        return FundraisingActivity.query.filter_by(status='active') \
            .order_by(FundraisingActivity.created_at.desc()) \
            .paginate(page=page, per_page=per_page, error_out=False)

    def get_featured_fsas(self, limit=6):
        return FundraisingActivity.query.filter_by(status='active') \
            .order_by(FundraisingActivity.current_amount.desc()) \
            .limit(limit).all()

    def search(self, query_string=None, filters=None, sort_by='created_at',
               sort_order='desc', page=1, per_page=12):
        query = FundraisingActivity.query.filter_by(status='active')

        if query_string:
            search = f'%{query_string}%'
            query = query.filter(
                db.or_(
                    FundraisingActivity.title.ilike(search),
                    FundraisingActivity.description.ilike(search)
                )
            )

        if filters:
            if filters.get('category_id'):
                query = query.filter_by(category_id=int(filters['category_id']))
            if filters.get('min_amount'):
                query = query.filter(FundraisingActivity.goal_amount >= float(filters['min_amount']))
            if filters.get('max_amount'):
                query = query.filter(FundraisingActivity.goal_amount <= float(filters['max_amount']))
            if filters.get('date_from'):
                query = query.filter(FundraisingActivity.created_at >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(FundraisingActivity.created_at <= filters['date_to'])

        # Sorting
        sort_column = getattr(FundraisingActivity, sort_by, FundraisingActivity.created_at)
        if sort_order == 'asc':
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        return query.paginate(page=page, per_page=per_page, error_out=False)

    def get_analytics(self, fsa_id, fundraiser_id):
        fsa = self.get_by_id(fsa_id)
        if fsa.fundraiser_id != fundraiser_id:
            return None
        return {
            'fsa': fsa,
            'view_count': fsa.view_count,
            'shortlist_count': fsa.shortlist_count,
            'donor_count': fsa.donor_count,
            'total_raised': fsa.current_amount,
            'progress': fsa.progress_percentage,
            'recent_donations': fsa.donations.order_by(
                db.text('created_at DESC')).limit(10).all()
        }

    def get_completed_history(self, fundraiser_id, filters=None, page=1, per_page=12):
        query = FundraisingActivity.query.filter_by(
            fundraiser_id=fundraiser_id, status='completed')

        if filters:
            if filters.get('category_id'):
                query = query.filter_by(category_id=int(filters['category_id']))
            if filters.get('date_from'):
                query = query.filter(FundraisingActivity.start_date >= filters['date_from'])
            if filters.get('date_to'):
                query = query.filter(FundraisingActivity.end_date <= filters['date_to'])

        query = query.order_by(FundraisingActivity.updated_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)

    def get_fundraiser_stats(self, fundraiser_id):
        fsas = FundraisingActivity.query.filter_by(fundraiser_id=fundraiser_id)
        active = fsas.filter_by(status='active').count()
        total_raised = db.session.query(db.func.sum(FundraisingActivity.current_amount)) \
            .filter_by(fundraiser_id=fundraiser_id).scalar() or 0
        total_views = db.session.query(db.func.sum(FundraisingActivity.view_count)) \
            .filter_by(fundraiser_id=fundraiser_id).scalar() or 0
        total_donors = sum(fsa.donor_count for fsa in fsas.all())
        return {
            'active_fsas': active,
            'total_raised': total_raised,
            'total_views': total_views,
            'total_donors': total_donors
        }

    def delete_image(self, image_id, fundraiser_id):
        image = FSAImage.query.get_or_404(image_id)
        if image.fsa.fundraiser_id != fundraiser_id:
            return False
        delete_uploaded_image(image.filename)
        db.session.delete(image)
        db.session.commit()
        return True
