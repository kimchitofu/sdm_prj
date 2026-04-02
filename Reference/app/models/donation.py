from datetime import datetime
from ..extensions import db


class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    message = db.Column(db.Text, nullable=True)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Keys
    donee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fsa_id = db.Column(db.Integer, db.ForeignKey('fundraising_activities.id'), nullable=False)

    def __repr__(self):
        return f'<Donation ${self.amount} by User {self.donee_id}>'
