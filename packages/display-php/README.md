# 🕌 Masjid Display — PHP Lightweight Edition

Lightweight PHP frontend for Mosque Display, optimized for **Chromium 65 on Raspberry Pi 3**.

## Prerequisites

- PHP 7.4+ (with `file_get_contents` and `allow_url_fopen` enabled)
- The Node.js API server running (default: `http://localhost:3000`)

## Quick Start

```bash
# 1. Make sure the Node.js API is running
cd packages/server && npm run dev

# 2. Serve the PHP display
cd packages/display-php
php -S 0.0.0.0:8080

# 3. Open in browser
# http://localhost:8080
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `http://localhost:3000/api` | Base URL of the Node.js API |

```bash
# Custom API URL
API_BASE_URL=http://192.168.1.100:3000/api php -S 0.0.0.0:8080
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name display.local;

    root /path/to/packages/display-php;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param API_BASE_URL http://localhost:3000/api;
        include fastcgi_params;
    }
}
```

## Raspberry Pi Kiosk Mode

Add to `/etc/xdg/lxsession/LXDE-pi/autostart`:

```bash
@chromium-browser --kiosk --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null http://localhost:8080
```

## Architecture

```
index.php   → Fetches data from Node.js API, renders HTML
style.css   → All styling (vanilla CSS, no frameworks)
```

- **Auto-refresh:** Page refreshes every 60 seconds via `<meta http-equiv="refresh">`
- **Live clock:** ~30 lines of vanilla JS update the clock and countdown every second
- **No frameworks:** Zero JS/CSS frameworks — works on Chromium 65+
