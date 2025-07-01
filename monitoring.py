from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.website import Website, UptimeCheck, Alert, Subscription
import requests
import time
from datetime import datetime, timedelta
import threading

monitoring_bp = Blueprint('monitoring', __name__)

def check_website_status(url):
    """Check website status and return results"""
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    start_time = time.time()
    try:
        response = requests.get(url, timeout=10, allow_redirects=True)
        response_time = int((time.time() - start_time) * 1000)
        
        if response.status_code == 200:
            return {
                'status': 'up',
                'response_time': response_time,
                'status_code': response.status_code,
                'error_message': None
            }
        else:
            return {
                'status': 'down',
                'response_time': response_time,
                'status_code': response.status_code,
                'error_message': f'HTTP {response.status_code}'
            }
    except Exception as e:
        response_time = int((time.time() - start_time) * 1000)
        return {
            'status': 'down',
            'response_time': response_time,
            'status_code': None,
            'error_message': str(e)
        }

@monitoring_bp.route('/check', methods=['POST'])
def check_website():
    """Manually check a website status"""
    data = request.get_json()
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    result = check_website_status(url)
    return jsonify(result)

@monitoring_bp.route('/websites', methods=['GET'])
def get_websites():
    """Get all websites for authenticated user"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    websites = Website.query.filter_by(user_id=user.id).all()
    return jsonify([{
        'id': w.id,
        'name': w.name,
        'url': w.url,
        'current_status': w.current_status,
        'last_checked': w.last_checked.isoformat() if w.last_checked else None,
        'check_interval': w.check_interval,
        'is_active': w.is_active
    } for w in websites])

@monitoring_bp.route('/websites', methods=['POST'])
def add_website():
    """Add a new website to monitor"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    data = request.get_json()
    name = data.get('name')
    url = data.get('url')
    check_interval = data.get('check_interval', 1800)
    
    if not name or not url:
        return jsonify({'error': 'Name and URL are required'}), 400
    
    # Check subscription limits
    subscription = user.subscription
    if not subscription:
        # Create free subscription
        subscription = Subscription(
            user_id=user.id,
            plan='free',
            max_websites=5,
            min_check_interval=1800,
            history_days=7
        )
        db.session.add(subscription)
    
    website_count = Website.query.filter_by(user_id=user.id).count()
    if website_count >= subscription.max_websites:
        return jsonify({'error': f'Maximum {subscription.max_websites} websites allowed for {subscription.plan} plan'}), 403
    
    if check_interval < subscription.min_check_interval:
        check_interval = subscription.min_check_interval
    
    website = Website(
        user_id=user.id,
        name=name,
        url=url,
        check_interval=check_interval
    )
    
    db.session.add(website)
    db.session.commit()
    
    return jsonify({
        'id': website.id,
        'name': website.name,
        'url': website.url,
        'check_interval': website.check_interval,
        'message': 'Website added successfully'
    }), 201

@monitoring_bp.route('/websites/<int:website_id>', methods=['DELETE'])
def delete_website(website_id):
    """Delete a website"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    website = Website.query.filter_by(id=website_id, user_id=user.id).first()
    if not website:
        return jsonify({'error': 'Website not found'}), 404
    
    db.session.delete(website)
    db.session.commit()
    
    return jsonify({'message': 'Website deleted successfully'})

@monitoring_bp.route('/websites/<int:website_id>/history', methods=['GET'])
def get_website_history(website_id):
    """Get uptime history for a website"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    website = Website.query.filter_by(id=website_id, user_id=user.id).first()
    if not website:
        return jsonify({'error': 'Website not found'}), 404
    
    # Get history based on subscription
    subscription = user.subscription or Subscription(plan='free', history_days=7)
    since_date = datetime.utcnow() - timedelta(days=subscription.history_days)
    
    checks = UptimeCheck.query.filter(
        UptimeCheck.website_id == website_id,
        UptimeCheck.timestamp >= since_date
    ).order_by(UptimeCheck.timestamp.desc()).limit(100).all()
    
    return jsonify([{
        'timestamp': check.timestamp.isoformat(),
        'status': check.status,
        'response_time': check.response_time,
        'status_code': check.status_code,
        'error_message': check.error_message
    } for check in checks])

@monitoring_bp.route('/websites/<int:website_id>/check', methods=['POST'])
def check_website_now(website_id):
    """Manually trigger a check for a specific website"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    website = Website.query.filter_by(id=website_id, user_id=user.id).first()
    if not website:
        return jsonify({'error': 'Website not found'}), 404
    
    result = check_website_status(website.url)
    
    # Save check result
    check = UptimeCheck(
        website_id=website.id,
        status=result['status'],
        response_time=result['response_time'],
        status_code=result['status_code'],
        error_message=result['error_message']
    )
    
    website.current_status = result['status']
    website.last_checked = datetime.utcnow()
    
    db.session.add(check)
    db.session.commit()
    
    return jsonify(result)

@monitoring_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics for user"""
    api_key = request.headers.get('X-API-Key')
    if not api_key:
        return jsonify({'error': 'API key required'}), 401
    
    user = User.query.filter_by(api_key=api_key).first()
    if not user:
        return jsonify({'error': 'Invalid API key'}), 401
    
    websites = Website.query.filter_by(user_id=user.id).all()
    total_websites = len(websites)
    up_websites = len([w for w in websites if w.current_status == 'up'])
    down_websites = len([w for w in websites if w.current_status == 'down'])
    
    # Calculate average uptime for last 24 hours
    since_24h = datetime.utcnow() - timedelta(hours=24)
    total_checks = 0
    up_checks = 0
    
    for website in websites:
        checks = UptimeCheck.query.filter(
            UptimeCheck.website_id == website.id,
            UptimeCheck.timestamp >= since_24h
        ).all()
        total_checks += len(checks)
        up_checks += len([c for c in checks if c.status == 'up'])
    
    uptime_percentage = (up_checks / total_checks * 100) if total_checks > 0 else 100
    
    return jsonify({
        'total_websites': total_websites,
        'up_websites': up_websites,
        'down_websites': down_websites,
        'uptime_percentage': round(uptime_percentage, 2),
        'subscription': user.subscription.plan if user.subscription else 'free'
    })

