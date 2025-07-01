from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.website import Subscription
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create new user
    user = User(username=username, email=email)
    user.set_password(password)
    user.trial_ends_at = datetime.utcnow() + timedelta(days=14)  # 14-day trial
    
    # Create free subscription
    subscription = Subscription(
        user_id=user.id,
        plan='free',
        max_websites=5,
        min_check_interval=1800,
        history_days=7,
        email_alerts=True,
        sms_alerts=False,
        api_access=False
    )
    
    db.session.add(user)
    db.session.flush()  # Get user ID
    subscription.user_id = user.id
    db.session.add(subscription)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'trial_ends_at': user.trial_ends_at.isoformat()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'api_key': user.api_key
    })

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    subscription = user.subscription
    return jsonify({
        'user': user.to_dict(),
        'subscription': {
            'plan': subscription.plan if subscription else 'free',
            'max_websites': subscription.max_websites if subscription else 5,
            'min_check_interval': subscription.min_check_interval if subscription else 1800,
            'history_days': subscription.history_days if subscription else 7,
            'email_alerts': subscription.email_alerts if subscription else True,
            'sms_alerts': subscription.sms_alerts if subscription else False,
            'api_access': subscription.api_access if subscription else False,
            'expires_at': subscription.expires_at.isoformat() if subscription and subscription.expires_at else None
        }
    })

@auth_bp.route('/subscription/upgrade', methods=['POST'])
def upgrade_subscription():
    """Upgrade user subscription"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    data = request.get_json()
    plan = data.get('plan')
    
    if plan not in ['pro', 'business', 'enterprise']:
        return jsonify({'error': 'Invalid plan'}), 400
    
    # Plan configurations
    plan_configs = {
        'pro': {
            'max_websites': 50,
            'min_check_interval': 300,  # 5 minutes
            'history_days': 90,
            'email_alerts': True,
            'sms_alerts': True,
            'api_access': True
        },
        'business': {
            'max_websites': 200,
            'min_check_interval': 60,  # 1 minute
            'history_days': 365,
            'email_alerts': True,
            'sms_alerts': True,
            'api_access': True
        },
        'enterprise': {
            'max_websites': 1000,
            'min_check_interval': 30,  # 30 seconds
            'history_days': 365,
            'email_alerts': True,
            'sms_alerts': True,
            'api_access': True
        }
    }
    
    config = plan_configs[plan]
    
    # Update or create subscription
    subscription = user.subscription
    if not subscription:
        subscription = Subscription(user_id=user.id)
        db.session.add(subscription)
    
    subscription.plan = plan
    subscription.max_websites = config['max_websites']
    subscription.min_check_interval = config['min_check_interval']
    subscription.history_days = config['history_days']
    subscription.email_alerts = config['email_alerts']
    subscription.sms_alerts = config['sms_alerts']
    subscription.api_access = config['api_access']
    subscription.expires_at = datetime.utcnow() + timedelta(days=30)  # 30-day subscription
    
    db.session.commit()
    
    return jsonify({
        'message': f'Successfully upgraded to {plan} plan',
        'subscription': {
            'plan': subscription.plan,
            'max_websites': subscription.max_websites,
            'min_check_interval': subscription.min_check_interval,
            'history_days': subscription.history_days,
            'expires_at': subscription.expires_at.isoformat()
        }
    })

@auth_bp.route('/pricing', methods=['GET'])
def get_pricing():
    """Get pricing information"""
    return jsonify({
        'plans': [
            {
                'name': 'Free',
                'price': 0,
                'features': [
                    '5 websites',
                    'Checks every 30 minutes',
                    '7-day history',
                    'Email alerts',
                    'Basic support'
                ],
                'max_websites': 5,
                'check_interval': '30 minutes',
                'history': '7 days'
            },
            {
                'name': 'Pro',
                'price': 9.99,
                'features': [
                    '50 websites',
                    'Checks every 5 minutes',
                    '90-day history',
                    'Email & SMS alerts',
                    'API access',
                    'Priority support'
                ],
                'max_websites': 50,
                'check_interval': '5 minutes',
                'history': '90 days',
                'popular': True
            },
            {
                'name': 'Business',
                'price': 29.99,
                'features': [
                    '200 websites',
                    'Checks every 1 minute',
                    '1-year history',
                    'All alert types',
                    'Full API access',
                    'Custom integrations',
                    'Priority support'
                ],
                'max_websites': 200,
                'check_interval': '1 minute',
                'history': '1 year'
            },
            {
                'name': 'Enterprise',
                'price': 99.99,
                'features': [
                    '1000+ websites',
                    'Checks every 30 seconds',
                    'Unlimited history',
                    'White-label solution',
                    'Custom integrations',
                    'Dedicated support',
                    'SLA guarantee'
                ],
                'max_websites': '1000+',
                'check_interval': '30 seconds',
                'history': 'Unlimited'
            }
        ]
    })

