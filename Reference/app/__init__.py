import os
from flask import Flask, render_template
from .config import config
from .extensions import db, login_manager, csrf


def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)

    # User loader for Flask-Login
    from .models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Register blueprints
    from .views.auth import auth_bp
    from .views.main import main_bp
    from .views.admin import admin_bp
    from .views.fundraiser import fundraiser_bp
    from .views.donee import donee_bp
    from .views.platform import platform_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(fundraiser_bp)
    app.register_blueprint(donee_bp)
    app.register_blueprint(platform_bp)

    # Register Jinja2 template filters
    @app.template_filter('currency')
    def format_currency(value):
        try:
            return "${:,.2f}".format(float(value))
        except (ValueError, TypeError):
            return "$0.00"

    @app.template_filter('timeago')
    def time_ago(value):
        from datetime import datetime
        if not value:
            return ''
        now = datetime.utcnow()
        diff = now - value
        seconds = diff.total_seconds()
        if seconds < 60:
            return 'just now'
        elif seconds < 3600:
            mins = int(seconds / 60)
            return f'{mins} min{"s" if mins > 1 else ""} ago'
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f'{hours} hour{"s" if hours > 1 else ""} ago'
        elif seconds < 2592000:
            days = int(seconds / 86400)
            return f'{days} day{"s" if days > 1 else ""} ago'
        else:
            return value.strftime('%d %b %Y')

    @app.template_filter('dateformat')
    def format_date(value, fmt='%d %b %Y'):
        if not value:
            return ''
        return value.strftime(fmt)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Create database tables
    with app.app_context():
        from .models import user, fundraising, category, donation, favourite, report
        db.create_all()

    # Error handlers
    @app.errorhandler(403)
    def forbidden(e):
        return render_template('errors/403.html'), 403

    @app.errorhandler(404)
    def not_found(e):
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(e):
        return render_template('errors/500.html'), 500

    return app
