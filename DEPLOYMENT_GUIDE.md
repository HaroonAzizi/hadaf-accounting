# Deployment Guide: Hadaf Accounting System on Ubuntu Server

## Overview

This guide will help you deploy your Hadaf full-stack application (React frontend + Node.js backend + SQLite) on your Ubuntu server and make it accessible via a domain name or IP address.

---

## Prerequisites

What you need:

- ✅ Ubuntu server (18.04+ or 20.04+ or 22.04+)
- ✅ SSH access to the server
- ✅ Root or sudo privileges
- ✅ Domain name (optional, but recommended) - e.g., hadaf.yourdomain.com
- ✅ Your Hadaf project code (backend + frontend)

---

## Deployment Architecture

Here's what we'll set up:

```
Internet
   ↓
Your Domain (hadaf.yourdomain.com)
   ↓
Nginx (Reverse Proxy) [Port 80/443]
   ↓
   ├→ Frontend (Static Files) → /var/www/hadaf/frontend
   ├→ Backend API (/api/*) → http://localhost:5000
   ↓
Node.js + Express (Port 5000)
   ↓
SQLite Database (/var/www/hadaf/backend/hadaf.db)
```

**Why this setup?**

- **Nginx**: Serves frontend files fast, handles SSL, reverse proxy for backend
- **PM2**: Keeps Node.js backend running 24/7, auto-restart on crashes
- **SQLite**: No separate database server needed, simple and efficient

---

## Step-by-Step Deployment

### **STEP 1: Initial Server Setup**

#### 1.1: Connect to Your Server

```bash
ssh username@your-server-ip
# Example: ssh root@192.168.1.100
# Or: ssh ubuntu@hadaf.yourdomain.com
```

#### 1.2: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

#### 1.3: Install Node.js (v18+)

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### 1.4: Install Nginx

```bash
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

#### 1.5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

#### 1.6: Install Git (if not already installed)

```bash
sudo apt install git -y
```

---

### **STEP 2: Upload Your Project to Server**

You have several options:

#### **Option A: Using Git (Recommended)**

On your local machine:

```bash
# Create a GitHub/GitLab repository and push your code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/hadaf.git
git push -u origin main
```

On your server:

```bash
# Create directory
sudo mkdir -p /var/www/hadaf
sudo chown -R $USER:$USER /var/www/hadaf

# Clone repository
cd /var/www/hadaf
git clone https://github.com/yourusername/hadaf.git .
```

#### **Option B: Using SCP (Direct Upload)**

On your local machine:

```bash
# From your project root directory
scp -r ./backend username@your-server-ip:/var/www/hadaf/
scp -r ./frontend username@your-server-ip:/var/www/hadaf/
```

#### **Option C: Using SFTP (FileZilla, WinSCP, etc.)**

1. Connect to your server via SFTP
2. Upload `backend` folder to `/var/www/hadaf/backend`
3. Upload `frontend` folder to `/var/www/hadaf/frontend`

---

### **STEP 3: Setup Backend**

#### 3.1: Install Backend Dependencies

```bash
cd /var/www/hadaf/backend
npm install --production
```

#### 3.2: Create Production Environment File

```bash
nano .env
```

Add this content:

```env
PORT=5000
NODE_ENV=production
DATABASE_PATH=/var/www/hadaf/backend/hadaf.db
```

Save and exit (Ctrl+X, then Y, then Enter)

#### 3.3: Test Backend Manually

```bash
# Try running it
npm start

# You should see: "Server running on port 5000"
# Press Ctrl+C to stop
```

#### 3.4: Setup PM2 to Keep Backend Running

Create PM2 configuration file:

```bash
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [
    {
      name: "hadaf-backend",
      script: "./server.js",
      cwd: "/var/www/hadaf/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/www/hadaf/logs/backend-error.log",
      out_file: "/var/www/hadaf/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

Create logs directory:

```bash
mkdir -p /var/www/hadaf/logs
```

Start backend with PM2:

```bash
cd /var/www/hadaf/backend
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs hadaf-backend

# Make PM2 start on system boot
pm2 startup
pm2 save
```

#### 3.5: Verify Backend is Running

```bash
curl http://localhost:5000/api/categories
# Should return JSON response
```

---

### **STEP 4: Setup Frontend**

#### 4.1: Update Frontend API URL

**File: `/var/www/hadaf/frontend/.env`**

```bash
nano /var/www/hadaf/frontend/.env
```

Add:

```env
# For production, use relative path (same domain)
VITE_API_URL=/api

# Or use your domain
# VITE_API_URL=https://hadaf.yourdomain.com/api
```

#### 4.2: Install Frontend Dependencies

```bash
cd /var/www/hadaf/frontend
npm install
```

#### 4.3: Build Frontend for Production

```bash
npm run build
```

This creates a `dist` folder with optimized static files.

#### 4.4: Move Built Files to Web Root

```bash
# Create directory for frontend
sudo mkdir -p /var/www/hadaf/public

# Copy built files
sudo cp -r /var/www/hadaf/frontend/dist/* /var/www/hadaf/public/

# Set permissions
sudo chown -R www-data:www-data /var/www/hadaf/public
```

---

### **STEP 5: Configure Nginx**

#### 5.1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/hadaf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-server-ip hadaf.yourdomain.com;  # Replace with your domain or IP

    # Frontend - Serve static files
    root /var/www/hadaf/public;
    index index.html;

    # Logs
    access_log /var/log/nginx/hadaf-access.log;
    error_log /var/log/nginx/hadaf-error.log;

    # Frontend - All non-API requests
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

#### 5.2: Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hadaf /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

### **STEP 6: Configure Firewall**

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for later SSL setup)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

### **STEP 7: Test Your Deployment**

#### 7.1: Check Backend

```bash
curl http://localhost:5000/api/categories
```

#### 7.2: Check Nginx

```bash
curl http://your-server-ip
# Should return your frontend HTML
```

#### 7.3: Open in Browser

```
http://your-server-ip
# or
http://hadaf.yourdomain.com
```

You should see your Hadaf application!

---

### **STEP 8: Setup SSL Certificate (HTTPS) - Recommended**

#### 8.1: Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 8.2: Obtain SSL Certificate

```bash
# Make sure your domain points to your server IP first!
sudo certbot --nginx -d hadaf.yourdomain.com

# Follow the prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

#### 8.3: Auto-Renewal Test

```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew your certificate before it expires.

#### 8.4: Update Backend CORS (if using HTTPS)

**File: `/var/www/hadaf/backend/src/app.js`**

Update CORS origin:

```javascript
app.use(
  cors({
    origin: [
      "https://hadaf.yourdomain.com", // Your HTTPS domain
      "http://localhost:5173", // Keep for local dev
    ],
    credentials: true,
  }),
);
```

Restart backend:

```bash
pm2 restart hadaf-backend
```

Now your site is accessible at: `https://hadaf.yourdomain.com` 🔒

---

### **STEP 9: Database Backup Strategy**

#### 9.1: Create Backup Script

```bash
nano /var/www/hadaf/backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/www/hadaf/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/var/www/hadaf/backend/hadaf.db"

mkdir -p $BACKUP_DIR

# Copy database
cp $DB_PATH $BACKUP_DIR/hadaf_backup_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "hadaf_backup_*.db" -mtime +7 -delete

echo "Backup completed: hadaf_backup_$DATE.db"
```

Make executable:

```bash
chmod +x /var/www/hadaf/backup.sh
```

#### 9.2: Schedule Daily Backups with Cron

```bash
crontab -e
```

Add this line (runs daily at 2 AM):

```cron
0 2 * * * /var/www/hadaf/backup.sh >> /var/www/hadaf/logs/backup.log 2>&1
```

---

### **STEP 10: Monitoring & Maintenance**

#### Useful Commands:

**PM2 (Backend Management)**

```bash
# View backend status
pm2 status

# View logs
pm2 logs hadaf-backend

# Restart backend
pm2 restart hadaf-backend

# Stop backend
pm2 stop hadaf-backend

# View monitoring dashboard
pm2 monit
```

**Nginx (Web Server)**

```bash
# Check status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View access logs
sudo tail -f /var/log/nginx/hadaf-access.log

# View error logs
sudo tail -f /var/log/nginx/hadaf-error.log
```

**Database**

```bash
# View database
sqlite3 /var/www/hadaf/backend/hadaf.db

# Inside SQLite:
.tables                          # List tables
SELECT * FROM transactions;      # View transactions
.quit                           # Exit
```

**System Resources**

```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
htop  # (install with: sudo apt install htop)
```

---

### **STEP 11: Updating Your Application**

When you make changes to your code:

#### Update Backend:

```bash
cd /var/www/hadaf/backend
git pull  # or upload new files
npm install  # if dependencies changed
pm2 restart hadaf-backend
```

#### Update Frontend:

```bash
cd /var/www/hadaf/frontend
git pull  # or upload new files
npm install  # if dependencies changed
npm run build
sudo cp -r dist/* /var/www/hadaf/public/
```

---

## Common Issues & Solutions

### Issue 1: "502 Bad Gateway"

**Cause**: Backend not running or crashed

**Solution**:

```bash
pm2 status
pm2 logs hadaf-backend
pm2 restart hadaf-backend
```

### Issue 2: "CORS Error" in Browser

**Cause**: Backend CORS not configured for your domain

**Solution**: Update backend CORS to include your domain (see Step 8.4)

### Issue 3: Frontend Shows But API Calls Fail

**Cause**: Nginx not proxying API requests correctly

**Solution**:

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/hadaf-error.log

# Verify backend is running
curl http://localhost:5000/api/categories

# Test Nginx proxy
curl http://your-server-ip/api/categories
```

### Issue 4: Database Locked Error

**Cause**: Multiple processes accessing SQLite

**Solution**:

```bash
# Find processes using the database
lsof /var/www/hadaf/backend/hadaf.db

# Restart backend
pm2 restart hadaf-backend
```

### Issue 5: PM2 Not Starting on Boot

**Solution**:

```bash
pm2 startup
# Copy and run the command it shows
pm2 save
```

---

## Security Best Practices

1. **Keep System Updated**:

```bash
sudo apt update && sudo apt upgrade -y
```

2. **Use Strong Passwords**: For SSH and any admin accounts

3. **Disable Root Login**:

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

4. **Setup Fail2Ban** (prevents brute force):

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

5. **Regular Backups**: Already set up in Step 9

6. **Monitor Logs**: Check regularly for suspicious activity

---

## Performance Optimization

### 1. Enable Nginx Gzip Compression

```bash
sudo nano /etc/nginx/nginx.conf
```

Uncomment or add:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. PM2 Cluster Mode (for high traffic)

```javascript
// In ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

---

## Final Checklist

- [ ] Node.js installed and working
- [ ] Backend runs with PM2
- [ ] PM2 starts on boot
- [ ] Frontend built and deployed
- [ ] Nginx configured and running
- [ ] Firewall configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Database backups scheduled
- [ ] Application accessible from internet
- [ ] API calls work correctly
- [ ] All features tested

**When all checked → Your Hadaf application is LIVE! 🚀**

---

## Quick Reference

**Your Application URLs**:

- Frontend: `https://hadaf.yourdomain.com`
- API: `https://hadaf.yourdomain.com/api`

**Important Paths**:

- Backend: `/var/www/hadaf/backend`
- Frontend: `/var/www/hadaf/public`
- Database: `/var/www/hadaf/backend/hadaf.db`
- Backups: `/var/www/hadaf/backups`
- Logs: `/var/www/hadaf/logs`

**Key Commands**:

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs hadaf-backend

# Restart backend
pm2 restart hadaf-backend

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/hadaf-error.log
```

---

**Congratulations! Your Hadaf Accounting System is now deployed and accessible to the world! 🎉**
