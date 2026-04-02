from datetime import datetime
from ..extensions import db


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), default='bi-heart')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    fundraising_activities = db.relationship('FundraisingActivity', backref='category', lazy='dynamic')

    def __repr__(self):
        return f'<Category {self.name}>'
