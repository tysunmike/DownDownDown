#!/usr/bin/env python3
"""
UptimePro Background Worker
Handles website monitoring checks and alert notifications
"""

import time
import logging
import requests
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the src directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user import User
from models.website import Website, MonitoringCheck

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/uptimepro_worker.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class UptimeWorker:
    def __init__(self):
        # Database setup
        database_url = os.getenv('DATABASE_URL', 'sqlite:///uptimepro.db')
        self.engine = create_engine(database_url)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        # Email configuration
        self.smtp_server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('MAIL_PORT', 587))
        self.smtp_username = os.getenv('MAIL_USERNAME')
        self.smtp_password = os.getenv('MAIL_PASSWORD')
        
        logger.info("UptimeWorker initialized")

    def check_website(self, website):
        """Check a single website's status"""
        try:
            logger.info(f"Checking website: {website.url}")
            
            start_time = time.time()
            response = requests.get(
                website.url,
                timeout=30,
                headers={'User-Agent': 'UptimePro Monitor/1.0'}
            )
            response_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
            
            # Determine status
            if response.status_code == 200:
                status = 'up'
                status_message = 'OK'
            else:
                status = 'down'
                status_message = f'HTTP {response.status_code}'
                
        except requests.exceptions.Timeout:
            status = 'down'
            status_message = 'Timeout'
            response_time = 30000
            
        except requests.exceptions.ConnectionError:
            status = 'down'
            status_message = 'Connection Error'
            response_time = 0
            
        except Exception as e:
            status = 'down'
            status_message = str(e)[:255]
            response_time = 0
            
        # Create monitoring check record
        check = MonitoringCheck(
            website_id=website.id,
            status=status,
            response_time=response_time,
            status_message=status_message,
            checked_at=datetime.utcnow()
        )
        
        self.session.add(check)
        
        # Update website current status
        previous_status = website.current_status
        website.current_status = status
        website.last_checked = datetime.utcnow()
        
        if status == 'up':
            website.last_up = datetime.utcnow()
        else:
            website.last_down = datetime.utcnow()
            
        self.session.commit()
        
        # Send alert if status changed from up to down
        if previous_status == 'up' and status == 'down':
            self.send_alert(website, status_message)
            
        logger.info(f"Website {website.url} status: {status} ({response_time}ms)")
        return check

    def send_alert(self, website, error_message):
        """Send email alert for website downtime"""
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.warning("Email credentials not configured, skipping alert")
                return
                
            user = self.session.query(User).filter_by(id=website.user_id).first()
            if not user:
                logger.error(f"User not found for website {website.id}")
                return
                
            # Create email
            msg = MimeMultipart()
            msg['From'] = self.smtp_username
            msg['To'] = user.email
            msg['Subject'] = f"🚨 Website Down Alert: {website.name}"
            
            body = f"""
            <html>
            <body>
                <h2>Website Down Alert</h2>
                <p>Your website <strong>{website.name}</strong> is currently down.</p>
                
                <table border="1" cellpadding="10" cellspacing="0">
                    <tr><td><strong>Website:</strong></td><td>{website.name}</td></tr>
                    <tr><td><strong>URL:</strong></td><td><a href="{website.url}">{website.url}</a></td></tr>
                    <tr><td><strong>Error:</strong></td><td>{error_message}</td></tr>
                    <tr><td><strong>Time:</strong></td><td>{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</td></tr>
                </table>
                
                <p>We'll continue monitoring and notify you when it's back online.</p>
                
                <p>Best regards,<br>UptimePro Team</p>
            </body>
            </html>
            """
            
            msg.attach(MimeText(body, 'html'))
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Alert sent to {user.email} for website {website.name}")
            
        except Exception as e:
            logger.error(f"Failed to send alert: {str(e)}")

    def cleanup_old_checks(self):
        """Remove old monitoring checks to keep database size manageable"""
        try:
            # Keep checks for different periods based on plan
            cutoff_dates = {
                'free': datetime.utcnow() - timedelta(days=7),
                'pro': datetime.utcnow() - timedelta(days=90),
                'business': datetime.utcnow() - timedelta(days=365),
                'enterprise': None  # Keep all data
            }
            
            for plan, cutoff_date in cutoff_dates.items():
                if cutoff_date is None:
                    continue
                    
                # Get users with this plan
                users = self.session.query(User).filter_by(subscription_plan=plan).all()
                
                for user in users:
                    # Get user's websites
                    websites = self.session.query(Website).filter_by(user_id=user.id).all()
                    
                    for website in websites:
                        # Delete old checks
                        old_checks = self.session.query(MonitoringCheck).filter(
                            MonitoringCheck.website_id == website.id,
                            MonitoringCheck.checked_at < cutoff_date
                        )
                        
                        deleted_count = old_checks.count()
                        old_checks.delete()
                        
                        if deleted_count > 0:
                            logger.info(f"Deleted {deleted_count} old checks for website {website.name}")
            
            self.session.commit()
            
        except Exception as e:
            logger.error(f"Failed to cleanup old checks: {str(e)}")
            self.session.rollback()

    def run_monitoring_cycle(self):
        """Run one complete monitoring cycle"""
        try:
            # Get all active websites
            websites = self.session.query(Website).filter_by(is_active=True).all()
            
            logger.info(f"Starting monitoring cycle for {len(websites)} websites")
            
            for website in websites:
                try:
                    # Check if it's time to monitor this website
                    if website.last_checked:
                        time_since_check = datetime.utcnow() - website.last_checked
                        if time_since_check.total_seconds() < website.check_interval:
                            continue
                    
                    self.check_website(website)
                    
                    # Small delay between checks to avoid overwhelming servers
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error checking website {website.url}: {str(e)}")
                    
            logger.info("Monitoring cycle completed")
            
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {str(e)}")

    def run(self):
        """Main worker loop"""
        logger.info("Starting UptimePro worker...")
        
        while True:
            try:
                # Run monitoring cycle
                self.run_monitoring_cycle()
                
                # Cleanup old data (run once per hour)
                if datetime.utcnow().minute == 0:
                    self.cleanup_old_checks()
                
                # Wait before next cycle (60 seconds)
                time.sleep(60)
                
            except KeyboardInterrupt:
                logger.info("Worker stopped by user")
                break
                
            except Exception as e:
                logger.error(f"Unexpected error in worker: {str(e)}")
                time.sleep(60)  # Wait before retrying

if __name__ == '__main__':
    worker = UptimeWorker()
    worker.run()

