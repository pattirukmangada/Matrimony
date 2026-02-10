# VivahBandhan - PHP Backend API

## 📋 Complete Setup Guide

---

### 1. System Requirements

| Software | Version |
|----------|---------|
| PHP | 8.0+ |
| MySQL | 8.0+ |
| Composer | 2.x |
| Apache/Nginx | Latest |
| cURL extension | Enabled |

---

### 2. Installation Steps

```bash
# 1. Clone or copy the backend folder to your server
cd /var/www/html/vivahbandhan   # or your web root

# 2. Install PHP dependencies
cd backend
composer install

# 3. Create the database
mysql -u root -p < database/schema.sql

# 4. Configure environment variables
cp .env.example .env
nano .env    # Fill in all values

# 5. Set file permissions
chmod 755 -R api/
chmod 700 config/
mkdir -p uploads && chmod 775 uploads/

# 6. Configure Apache virtual host (see below)
```

---

### 3. Apache Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName api.vivahbandhan.com
    DocumentRoot /var/www/html/vivahbandhan/backend

    <Directory /var/www/html/vivahbandhan/backend>
        AllowOverride All
        Require all granted
    </Directory>

    # Enable PHP
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>

    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</VirtualHost>
```

Enable the site:
```bash
sudo a2enmod rewrite headers
sudo a2ensite vivahbandhan
sudo systemctl restart apache2
```

---

### 4. Nginx Configuration (Alternative)

```nginx
server {
    listen 80;
    server_name api.vivahbandhan.com;
    root /var/www/html/vivahbandhan/backend;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # Block config and vendor access
    location ~ /(config|vendor|\.env|\.git) {
        deny all;
    }
}
```

---

### 5. Environment Variables

Create `.env` from `.env.example` and configure:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `vivahbandhan` |
| `DB_USER` | MySQL user | `vivah_user` |
| `DB_PASS` | MySQL password | `strong_password` |
| `JWT_SECRET` | 64-char random string | `openssl rand -hex 32` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your@gmail.com` |
| `SMTP_PASS` | SMTP app password | [Generate here](https://myaccount.google.com/apppasswords) |
| `SMTP_FROM` | Sender email | `noreply@vivahbandhan.com` |
| `MSG91_AUTH_KEY` | MSG91 API key | From [MSG91 dashboard](https://msg91.com) |
| `RAZORPAY_KEY_ID` | Razorpay key ID | From [Razorpay dashboard](https://dashboard.razorpay.com) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | From Razorpay dashboard |
| `FRONTEND_URL` | React app URL | `http://localhost:5173` |

---

### 6. Database Setup

Run the complete schema:

```bash
mysql -u root -p < database/schema.sql
```

**Tables created:**
| Table | Purpose |
|-------|---------|
| `users` | Authentication + approval status |
| `admins` | Separate admin login |
| `profiles` | User profile details |
| `partner_preferences` | Match preferences |
| `photos` | Photo gallery (admin-approved) |
| `profile_verifications` | Verification badges |
| `interests` | Interest send/accept flow |
| `messages` | Polling-based chat |
| `subscriptions` | Subscription plans + Razorpay |
| `privacy_settings` | Phone/photo visibility |
| `otp_logs` | OTP storage + rate limiting |
| `admin_notifications` | Admin approval queue |

**Default admin login:**
- Username: `admin`
- Password: `Admin@123` (**change immediately!**)

---

### 7. API Endpoints Reference

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register.php` | Register + send OTP |
| POST | `/api/auth/verify-otp.php` | Verify email/mobile OTP |
| POST | `/api/auth/login.php` | User login → JWT |
| POST | `/api/auth/admin-login.php` | Admin login → JWT |

#### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/get.php?user_id=X` | Get profile (access-controlled) |
| POST | `/api/profile/update.php` | Create/update own profile |

#### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/index.php` | Search profiles (admin-approved only) |
| | Params: `age_min, age_max, religion, caste, city, education, income, marital_status, page, limit` |

#### Interests
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interest/send.php` | Send interest (admin notified) |
| POST | `/api/interest/respond.php` | Accept/reject interest |
| GET | `/api/interest/list.php?type=received` | List interests |

#### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages/send.php` | Send message (Gold/Platinum only) |
| GET | `/api/messages/conversation.php?user_id=X` | Get conversation |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order.php` | Create Razorpay order |
| POST | `/api/payment/verify.php` | Verify payment + activate plan |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard.php` | Analytics + pending counts |
| GET/POST | `/api/admin/users.php` | List/ban/suspend users |
| POST | `/api/admin/approve-user.php` | Approve/reject user profile |
| POST | `/api/admin/approve-interest.php` | Approve/reject interest |
| POST | `/api/admin/approve-photo.php` | Approve/reject photo |
| POST | `/api/admin/verify-id.php` | Approve/reject ID verification |
| GET | `/api/admin/notifications.php` | List admin notifications |

---

### 8. Frontend Configuration

In your React app, set the API base URL:

```env
# .env in React project root
VITE_API_BASE_URL=http://localhost/vivahbandhan/backend/api
```

Example API call in React:
```typescript
const API = import.meta.env.VITE_API_BASE_URL;

// Login
const res = await fetch(`${API}/auth/login.php`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const data = await res.json();
localStorage.setItem('token', data.token);

// Authenticated request
const profile = await fetch(`${API}/profile/get.php?user_id=1`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
```

---

### 9. Business Logic Summary

#### Registration → Approval Flow
```
User registers → OTP sent (email+mobile) → User verifies OTP → Account activated
→ Admin gets notification → Admin approves → Profile visible in search
```

#### Interest → Messaging Flow
```
User A sends interest → Admin gets notification → Admin approves interest
→ User B sees interest → User B accepts → Mutual match established
→ Messaging unlocked (Gold/Platinum only) → Phone visible (per privacy settings)
```

#### Privacy Controls
- `show_phone`: nobody | premium_only | after_interest | everyone
- `show_photos`: public | premium | after_interest
- Non-authorized viewers see: `98XXXXXX45`

#### Subscription Plans
| Feature | Free | Gold (₹999/3mo) | Platinum (₹1999/6mo) |
|---------|------|------|----------|
| Send interests | 5/day | Unlimited | Unlimited |
| View phone | ❌ | ✅ | ✅ |
| Messaging | ❌ | ✅ | ✅ |
| Profile boost | ❌ | ✅ | ✅ |
| Premium badge | ❌ | ❌ | ✅ |
| Search priority | ❌ | ❌ | ✅ |

---

### 10. Security Checklist

- [x] Password hashing with `password_hash()` (bcrypt, cost 12)
- [x] JWT authentication on all protected endpoints
- [x] PDO prepared statements (SQL injection prevention)
- [x] Input sanitization with `htmlspecialchars()` + length limits
- [x] OTP rate limiting (5/hour per identifier)
- [x] CORS restricted to frontend URL
- [x] File upload validation (implement in photo upload)
- [x] Separate admin authentication system
- [x] Admin approval required for profiles, photos, interests, ID verification
- [x] Environment variables for secrets (never hardcoded)
- [x] `.htaccess` blocks config/vendor access

---

### 11. Project Structure

```
backend/
├── config/
│   ├── database.php        # MySQL PDO connection
│   ├── jwt.php             # JWT generation/validation
│   ├── cors.php            # CORS headers
│   └── mail.php            # OTP email + SMS service
├── database/
│   └── schema.sql          # Complete MySQL schema (12 tables)
├── api/
│   ├── auth/
│   │   ├── register.php    # Register + send OTP
│   │   ├── verify-otp.php  # Verify OTP
│   │   ├── login.php       # User login
│   │   └── admin-login.php # Admin login
│   ├── profile/
│   │   ├── get.php         # Get profile (access-controlled)
│   │   └── update.php      # Update own profile
│   ├── search/
│   │   └── index.php       # Search with filters
│   ├── interest/
│   │   ├── send.php        # Send interest
│   │   ├── respond.php     # Accept/reject interest
│   │   └── list.php        # List interests
│   ├── messages/
│   │   ├── send.php        # Send message
│   │   └── conversation.php # Get conversation
│   ├── payment/
│   │   ├── create-order.php # Razorpay order
│   │   └── verify.php      # Verify payment
│   └── admin/
│       ├── dashboard.php   # Analytics
│       ├── users.php       # List/ban users
│       ├── approve-user.php
│       ├── approve-interest.php
│       ├── approve-photo.php
│       ├── verify-id.php
│       └── notifications.php
├── uploads/                # User-uploaded files
├── .env.example            # Environment template
├── .htaccess               # Apache config
├── composer.json           # PHP dependencies
└── README.md               # This file
```
