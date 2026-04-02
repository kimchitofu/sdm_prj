from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, fundraiser, donee, platform
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    profile_image = db.Column(db.String(256), default='default_avatar.png')
    bio = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_suspended = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    fundraising_activities = db.relationship('FundraisingActivity', backref='fundraiser', lazy='dynamic')
    donations = db.relationship('Donation', backref='donee', lazy='dynamic')
    favourites = db.relationship('Favourite', backref='donee_user', lazy='dynamic')
    reports = db.relationship('Report', backref='generated_by_user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    def is_admin(self):
        return self.role == 'admin'

    def is_fundraiser(self):
        return self.role == 'fundraiser'

    def is_donee(self):
        return self.role == 'donee'

    def is_platform(self):
        return self.role == 'platform'

    def __repr__(self):
        return f'<User {self.username} ({self.role})>'
