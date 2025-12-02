# Nginx configuration for 5LB application stack
# Configured for domain app.5lb.pro; adjust certificate paths if needed

upstream 5lb_backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

upstream crm_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    server_name app.5lb.pro;

    # Force HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.5lb.pro;

    ssl_certificate /etc/letsencrypt/live/app.5lb.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.5lb.pro/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_trusted_certificate /etc/letsencrypt/live/app.5lb.pro/chain.pem;

    # Increase buffers for large payloads (images / JSON)
    client_max_body_size 10m;

    # Serve uploaded files (avatars, etc.) directly from filesystem - MUST be FIRST
    location ^~ /api/uploads/ {
        alias /root/5lb/backend/dist/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "https://app.5lb.pro";
        access_log off;
    }

    # CRM Backend API
    location /crm-api/ {
        proxy_pass http://crm_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # CRM Frontend
    location /crm {
        alias /var/www/5lb-crm;
        index index.html;
        try_files $uri $uri/ /crm/index.html;
    }

    # Static frontend build (main app)
    location / {
        root /var/www/5lb/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://5lb_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: serve static assets with longer cache (only for frontend static files)
    location ~* ^/assets/.*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        root /var/www/5lb/dist;
        try_files $uri =404;
        expires 7d;
        add_header Cache-Control "public";
    }

    access_log /var/log/nginx/5lb.access.log;
    error_log /var/log/nginx/5lb.error.log;
}
