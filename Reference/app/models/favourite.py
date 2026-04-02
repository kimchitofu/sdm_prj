from datetime import datetime
from ..extensions import db


class Favourite(db.Model):
    __tablename__ = 'favourites'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Foreign Keys
    donee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fsa_id = db.Column(db.Integer, db.ForeignKey('fundraising_activities.id'), nullable=False)

    # Unique constraint: a donee can favourite an FSA only once
    __table_args__ = (db.UniqueConstraint('donee_id', 'fsa_id', name='uq_donee_fsa'),)

    def __repr__(self):
        return f'<Favourite User {self.donee_id} -> FSA {self.fsa_id}>'
