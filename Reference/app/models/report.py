import json
from datetime import datetime
from ..extensions import db


class Report(db.Model):
    __tablename__ = 'reports'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    report_type = db.Column(db.String(20), nullable=False)  # daily, weekly, monthly
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    total_donations = db.Column(db.Float, default=0.0)
    total_fsas_created = db.Column(db.Integer, default=0)
    total_fsas_completed = db.Column(db.Integer, default=0)
    total_new_users = db.Column(db.Integer, default=0)
    report_data = db.Column(db.Text, nullable=True)  # JSON string
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def get_data(self):
        if self.report_data:
            return json.loads(self.report_data)
        return {}

    def set_data(self, data):
        self.report_data = json.dumps(data)

    def __repr__(self):
        return f'<Report {self.title} ({self.report_type})>'
