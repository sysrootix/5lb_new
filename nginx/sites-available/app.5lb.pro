# HTTP → HTTPS redirect
server {
    listen 80;
    server_name app.5lb.pro;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name app.5lb.pro;

    ssl_certificate     /etc/letsencrypt/live/app.5lb.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.5lb.pro/privkey.pem;

    client_max_body_size 20M;

    # API
    location /api/ {
        proxy_pass         http://[::1]:60000/api/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    }

    # Статические файлы фронтенда
    location / {
        root /var/www/5lb/dist;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
