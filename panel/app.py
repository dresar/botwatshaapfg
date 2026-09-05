from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from functools import wraps
from dotenv import load_dotenv
import os
import requests
import time
import base64

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-this')

BOT_API_URL = os.getenv('BOT_API_URL', 'http://localhost:3000')
BOT_API_KEY = os.getenv('BOT_API_KEY', 'your-secret-api-key-here')
PANEL_USER = os.getenv('PANEL_USER', 'admin')
PANEL_PASS = os.getenv('PANEL_PASS', 'admin123')

def check_auth(username, password):
    return username == PANEL_USER and password == PANEL_PASS

def authenticate():
    return ('Authentication required', 401,
            {'WWW-Authenticate': 'Basic realm="WhatsApp Bot Panel"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

def call_bot_api(endpoint, method='GET', data=None, timeout=5):
    try:
        headers = {'x-api-key': BOT_API_KEY}
        if data:
            headers['Content-Type'] = 'application/json'
        
        url = f'{BOT_API_URL}{endpoint}'
        
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=timeout)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
        else:
            return None
        
        if response.status_code == 200:
            return response.json()
        return None
    except requests.exceptions.RequestException:
        return None

@app.route('/')
@requires_auth
def dashboard():
    status_data = call_bot_api('/api/status')
    
    bot_online = status_data is not None
    connection_status = 'offline'
    qr_code = None
    uptime = 'N/A'
    
    if status_data and status_data.get('status'):
        data = status_data.get('data', {})
        connection_status = data.get('connectionStatus', 'offline')
        qr_code = data.get('qrCode', None)
        uptime = data.get('uptime', 'N/A')
    
    return render_template('dashboard.html',
                         bot_online=bot_online,
                         connection_status=connection_status,
                         qr_code=qr_code,
                         uptime=uptime)

@app.route('/restart', methods=['POST'])
@requires_auth
def restart_bot():
    result = call_bot_api('/api/restart', method='POST', timeout=5)
    
    if result and result.get('status'):
        flash('Bot restart command sent successfully', 'success')
    else:
        flash('Bot is offline. Cannot send restart command.', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/send', methods=['GET', 'POST'])
@requires_auth
def send_message():
    if request.method == 'POST':
        to = request.form.get('to', '').strip()
        message = request.form.get('message', '').strip()
        
        if not to or not message:
            flash('Phone number and message are required', 'error')
            return render_template('send_message.html')
        
        result = call_bot_api('/api/send-message', method='POST',
                             data={'to': to, 'message': message}, timeout=10)
        
        if result and result.get('status'):
            flash('Message sent successfully', 'success')
        else:
            flash('Bot is offline. Cannot send message.', 'error')
        
        return redirect(url_for('send_message'))
    
    return render_template('send_message.html')

@app.route('/autoreply', methods=['GET', 'POST'])
@requires_auth
def autoreply():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'add':
            keyword = request.form.get('keyword', '').strip()
            response_text = request.form.get('response', '').strip()
            
            if not keyword or not response_text:
                flash('Keyword and response are required', 'error')
            else:
                result = call_bot_api('/api/autoreply/add', method='POST',
                                     data={'keyword': keyword, 'response': response_text}, timeout=5)
                
                if result and result.get('status'):
                    flash('Auto-reply added successfully', 'success')
                else:
                    flash('Bot is offline. Cannot add auto-reply.', 'error')
        
        elif action == 'delete':
            keyword = request.form.get('keyword', '').strip()
            
            if keyword:
                result = call_bot_api('/api/autoreply/delete', method='POST',
                                     data={'keyword': keyword}, timeout=5)
                
                if result and result.get('status'):
                    flash('Auto-reply deleted successfully', 'success')
                else:
                    flash('Bot is offline. Cannot delete auto-reply.', 'error')
        
        return redirect(url_for('autoreply'))
    
    autoreplies = {}
    bot_online = False
    
    result = call_bot_api('/api/autoreply/list', timeout=5)
    if result and result.get('status'):
        autoreplies = result.get('data', {})
        bot_online = True
    else:
        flash('Bot is offline. Cannot load auto-replies.', 'warning')
    
    return render_template('autoreply.html', autoreplies=autoreplies, bot_online=bot_online)

@app.route('/broadcast', methods=['GET', 'POST'])
@requires_auth
def broadcast():
    if request.method == 'POST':
        numbers_str = request.form.get('numbers', '').strip()
        message = request.form.get('message', '').strip()
        
        if not numbers_str or not message:
            flash('Phone numbers and message are required', 'error')
            return render_template('broadcast.html')
        
        numbers = [num.strip() for num in numbers_str.split(',') if num.strip()]
        
        if not numbers:
            flash('Please provide at least one phone number', 'error')
            return render_template('broadcast.html')
        
        success_count = 0
        fail_count = 0
        
        for number in numbers:
            result = call_bot_api('/api/send-message', method='POST',
                                 data={'to': number, 'message': message}, timeout=10)
            
            if result and result.get('status'):
                success_count += 1
            else:
                fail_count += 1
            
            time.sleep(0.5)
        
        if success_count > 0:
            flash(f'Broadcast sent: {success_count} success, {fail_count} failed', 'success')
        else:
            flash(f'Broadcast failed: All {fail_count} messages failed. Bot may be offline.', 'error')
        
        return redirect(url_for('broadcast'))
    
    return render_template('broadcast.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

