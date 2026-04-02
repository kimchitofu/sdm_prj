from . import BaseController, db
from ..models.user import User


class UserController(BaseController):
    model = User

    def authenticate(self, email, password):
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            if user.is_suspended:
                return None, 'Your account has been suspended.'
            return user, None
        return None, 'Invalid email or password.'

    def register(self, email, username, password, role, first_name, last_name, phone=None):
        if User.query.filter_by(email=email).first():
            return None, 'Email already registered.'
        if User.query.filter_by(username=username).first():
            return None, 'Username already taken.'

        user = User(
            email=email,
            username=username,
            role=role,
            first_name=first_name,
            last_name=last_name,
            phone=phone
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user, None

    def suspend_user(self, user_id):
        user = self.get_by_id(user_id)
        user.is_suspended = True
        db.session.commit()
        return user

    def reactivate_user(self, user_id):
        user = self.get_by_id(user_id)
        user.is_suspended = False
        db.session.commit()
        return user

    def update_profile(self, user_id, **kwargs):
        user = self.get_by_id(user_id)
        for key, value in kwargs.items():
            if hasattr(user, key) and key not in ('id', 'password_hash', 'role'):
                setattr(user, key, value)
        db.session.commit()
        return user

    def get_users_by_role(self, role, page=1, per_page=20):
        query = User.query.filter_by(role=role)
        return query.paginate(page=page, per_page=per_page, error_out=False)

    def search(self, query_string, filters=None, page=1, per_page=20):
        query = User.query
        if query_string:
            search = f'%{query_string}%'
            query = query.filter(
                db.or_(
                    User.username.ilike(search),
                    User.email.ilike(search),
                    User.first_name.ilike(search),
                    User.last_name.ilike(search)
                )
            )
        if filters:
            if filters.get('role'):
                query = query.filter_by(role=filters['role'])
            if filters.get('is_suspended') is not None:
                query = query.filter_by(is_suspended=filters['is_suspended'])
        query = query.order_by(User.created_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)

    def get_user_stats(self):
        return {
            'total': User.query.count(),
            'admins': User.query.filter_by(role='admin').count(),
            'fundraisers': User.query.filter_by(role='fundraiser').count(),
            'donees': User.query.filter_by(role='donee').count(),
            'platform': User.query.filter_by(role='platform').count(),
            'suspended': User.query.filter_by(is_suspended=True).count()
        }
