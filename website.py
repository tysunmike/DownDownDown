from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Website(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    check_interval = db.Column(db.Integer, default=1800)  # seconds, default 30 minutes
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_checked = db.Column(db.DateTime)
    current_status = db.Column(db.String(20), default='unknown')  # up, down, unknown
    
    # Relationships
    checks = db.relationship('UptimeCheck', backref='website', lazy=True, cascade='all, delete-orphan')
    alerts = db.relationship('Alert', backref='website', lazy=True, cascade='all, delete-orphan')

class UptimeCheck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False)  # up, down
    response_time = db.Column(db.Integer)  # milliseconds
    status_code = db.Column(db.Integer)
    error_message = db.Column(db.Text)
    location = db.Column(db.String(50), default='US-East')

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    alert_type = db.Column(db.String(20), nullable=False)  # email, sms, webhook
    is_enabled = db.Column(db.Boolean, default=True)
    endpoint = db.Column(db.String(500))  # email address, phone number, webhook URL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plan = db.Column(db.String(20), nullable=False)  # free, pro, business, enterprise
    status = db.Column(db.String(20), default='active')  # active, cancelled, expired
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    stripe_subscription_id = db.Column(db.String(100))
    
    # Plan limits
    max_websites = db.Column(db.Integer, default=5)
    min_check_interval = db.Column(db.Integer, default=1800)  # seconds
    history_days = db.Column(db.Integer, default=7)
    email_alerts = db.Column(db.Boolean, default=True)
    sms_alerts = db.Column(db.Boolean, default=False)
    api_access = db.Column(db.Boolean, default=False)

