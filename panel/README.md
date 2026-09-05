# WhatsApp Bot Control Panel (Flask)

Flask-based web dashboard to control WhatsApp Bot via API.

## Quick Start (Windows)

### Option 1: Using PowerShell Script (Recommended)
```powershell
# Run setup script
.\setup.ps1

# Run the application
.\run.ps1
```

### Option 2: Using Batch File
```cmd
# Run setup script
setup.bat

# Run the application
run.bat
```

### Option 3: Manual Setup
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

## Configuration

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file with your settings:
```
PANEL_USER=admin
PANEL_PASS=admin123
BOT_API_URL=http://localhost:3000
BOT_API_KEY=your-secret-api-key-here
FLASK_ENV=development
FLASK_DEBUG=True
```

## Features

- **Dashboard**: View bot status, QR code, and restart bot
- **Send Message**: Send individual WhatsApp messages
- **Auto Reply Manager**: Add/delete auto-reply keywords
- **Broadcast**: Send messages to multiple numbers

## Authentication

The panel uses HTTP Basic Authentication. When you access the site, your browser will prompt for username and password (from `.env`).

## Access

After running the app, access the panel at: `http://localhost:5000`

## Troubleshooting

### If `pip` is not recognized:
- Make sure Python is installed
- Add Python to PATH during installation
- Use `python -m pip` instead of `pip`

### If PowerShell script execution is blocked:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### If virtual environment activation fails:
- Make sure you're in the `panel` directory
- Use full path: `.\.venv\Scripts\Activate.ps1`
- For Command Prompt, use: `.venv\Scripts\activate.bat`
