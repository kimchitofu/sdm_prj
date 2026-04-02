from datetime import datetime
from ..extensions import db


class FundraisingActivity(db.Model):
    __tablename__ = 'fundraising_activities'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    goal_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='draft')  # draft, active, paused, completed, cancelled
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    view_count = db.Column(db.Integer, default=0)
    shortlist_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign Keys
    fundraiser_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    # Relationships
    images = db.relationship('FSAImage', backref='fsa', lazy='dynamic', cascade='all, delete-orphan')
    donations = db.relationship('Donation', backref='fsa', lazy='dynamic')
    favourites = db.relationship('Favourite', backref='fsa', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def progress_percentage(self):
        if self.goal_amount == 0:
            return 0
        return min(round((self.current_amount / self.goal_amount) * 100, 1), 100)

    @property
    def donor_count(self):
        return self.donations.count()

    @property
    def is_fully_funded(self):
        return self.current_amount >= self.goal_amount

    @property
    def primary_image(self):
        img = self.images.filter_by(is_primary=True).first()
        if img:
            return img.filename
        img = self.images.first()
        return img.filename if img else 'default_fsa.png'

    @property
    def days_remaining(self):
        if not self.end_date:
            return None
        delta = self.end_date - datetime.utcnow()
        return max(0, delta.days)

    def __repr__(self):
        return f'<FSA {self.title} ({self.status})>'


class FSAImage(db.Model):
    __tablename__ = 'fsa_images'

    id = db.Column(db.Integer, primary_key=True)
    fsa_id = db.Column(db.Integer, db.ForeignKey('fundraising_activities.id'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<FSAImage {self.filename}>'
