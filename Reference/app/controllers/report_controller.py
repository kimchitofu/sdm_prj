import json
from datetime import datetime, timedelta
from . import BaseController, db
from ..models.report import Report
from ..models.donation import Donation
from ..models.fundraising import FundraisingActivity
from ..models.user import User


class ReportController(BaseController):
    model = Report

    def generate_report(self, report_type, generated_by_id):
        now = datetime.utcnow()

        if report_type == 'daily':
            period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            period_end = now
            title = f"Daily Report - {now.strftime('%d %b %Y')}"
        elif report_type == 'weekly':
            period_start = now - timedelta(days=7)
            period_end = now
            title = f"Weekly Report - {period_start.strftime('%d %b')} to {now.strftime('%d %b %Y')}"
        elif report_type == 'monthly':
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            period_end = now
            title = f"Monthly Report - {now.strftime('%B %Y')}"
        else:
            return None, 'Invalid report type.'

        # Calculate stats for the period
        total_donations = db.session.query(db.func.sum(Donation.amount)) \
            .filter(Donation.created_at.between(period_start, period_end)).scalar() or 0
        donation_count = Donation.query.filter(
            Donation.created_at.between(period_start, period_end)).count()
        total_fsas_created = FundraisingActivity.query.filter(
            FundraisingActivity.created_at.between(period_start, period_end)).count()
        total_fsas_completed = FundraisingActivity.query.filter(
            FundraisingActivity.status == 'completed',
            FundraisingActivity.updated_at.between(period_start, period_end)).count()
        total_new_users = User.query.filter(
            User.created_at.between(period_start, period_end)).count()

        # Category breakdown
        from ..models.category import Category
        categories = Category.query.all()
        category_data = []
        for cat in categories:
            cat_donations = db.session.query(db.func.sum(Donation.amount)) \
                .join(FundraisingActivity) \
                .filter(
                    FundraisingActivity.category_id == cat.id,
                    Donation.created_at.between(period_start, period_end)
                ).scalar() or 0
            cat_fsa_count = FundraisingActivity.query.filter(
                FundraisingActivity.category_id == cat.id,
                FundraisingActivity.created_at.between(period_start, period_end)
            ).count()
            category_data.append({
                'name': cat.name,
                'donations': cat_donations,
                'fsa_count': cat_fsa_count
            })

        report_data = {
            'donation_count': donation_count,
            'category_breakdown': category_data,
            'avg_donation': total_donations / donation_count if donation_count > 0 else 0
        }

        report = Report(
            title=title,
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            total_donations=total_donations,
            total_fsas_created=total_fsas_created,
            total_fsas_completed=total_fsas_completed,
            total_new_users=total_new_users,
            generated_by=generated_by_id
        )
        report.set_data(report_data)
        db.session.add(report)
        db.session.commit()
        return report, None

    def get_dashboard_stats(self):
        return {
            'total_fsas': FundraisingActivity.query.count(),
            'active_fsas': FundraisingActivity.query.filter_by(status='active').count(),
            'total_donated': db.session.query(db.func.sum(Donation.amount)).scalar() or 0,
            'total_users': User.query.count(),
            'total_categories': db.session.query(db.func.count(
                db.distinct(FundraisingActivity.category_id))).scalar() or 0
        }

    def get_reports_history(self, page=1, per_page=20):
        return Report.query.order_by(Report.generated_at.desc()) \
            .paginate(page=page, per_page=per_page, error_out=False)
